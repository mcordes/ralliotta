import {User} from "../types/User";
import {Project} from "../types/Project";
import {Ref} from "../types/Ref";
import {DateTime} from "luxon";
import {Iteration, ITERATION_SEARCH_FIELDS} from "../types/Iteration";
import {Artifact, ARTIFACT_SEARCH_FIELDS} from "../types/Artifact";
import {Release} from "../types/Release";
import {FlowState} from "../types/FlowState";
import {REVISION_SEARCH_FIELDS} from "../types/Revision";
import {Comment, COMMENT_SEARCH_FIELDS} from "../types/Comment";
import {Attachment, ATTACHMENT_SEARCH_FIELDS} from "../types/Attachment";
import {orderBy} from "lodash";
import {TeamMember} from "../types/TeamMember";
import {NotFoundError} from "../exceptions";
import {queryUtils, refUtils} from "../utils/util";


export interface SearchResults {
    items: any[];
    hasMoreResults: boolean;
    totalRecords: number;
}

export interface ListOptions {
    query?: any;
    startIndex?: number;
    pageSize?: number;
    order?: string;
    kwargs?: {[key: string]: any}
    projectScope?: Project | Ref;
}

export interface Scope {
    project?: string;

    // NOTE: the up/down has to do with the way Rally does project hierarchy searches. Hopefully we can ignore
    // this in most cases.
    up?: boolean;
    down?: boolean;
}

export interface AddUpdateFieldData {
    [key: string]: string | boolean | number | null
}

export type ActivityType = "comment" | "revision" | "attachment";

export interface ActivityItem {
    type: ActivityType,
    data: any;
    date: Date;
    userName: string;
    user: Ref;
}

export function toActivityItem(thing: any, type: ActivityType) {
    const result: ActivityItem = {
        type: type,
        data: thing,
        date: thing.CreationDate,
        userName: thing.User._refObjectName,
        user: thing.User
    };
    return result;
}

export abstract class Service {
    abstract fetchCurrentUser(): Promise<User>;
    abstract login(username: string, password: string): Promise<{sessionId: string, securityToken: string}>;
    abstract fetchSingleItemByRef(ref: string | Ref): Promise<any>;
    abstract fetchListOfItems(type: string, fields: string[], options: ListOptions): Promise<any>;
    abstract updateItem(ref: string, data: AddUpdateFieldData): Promise<any>;
    abstract createItem(type: string, data: AddUpdateFieldData): Promise<any>;
    abstract getAvatarImageURL(user: User | Ref, size: number): string;

    async getActivityForItem(item: Artifact) {
        const revisionHistoryRef = item.RevisionHistory;
        const activity: ActivityItem[] = [];

        const [comments, revisions, attachments] = await Promise.all([
            this.fetchComments(item._ref),
            this.fetchRevisionHistory(revisionHistoryRef),
            this.fetchAttachments(item._ref)
        ]);

        for (const comment of comments) {
            activity.push(toActivityItem(comment, 'comment'));
        }

        for (const revision of revisions) {
            activity.push(toActivityItem(revision, 'revision'));
        }

        for (const attachment of attachments) {
            activity.push(toActivityItem(attachment, 'attachment'));
        }

        return orderBy(activity, ['date']);
    }

    async getArtifactsGroupedByFlowState(projectRef: Ref | string, iterationRef: Ref) {
        const query = queryUtils.where('Project', '=', projectRef);
        const itemQuery = queryUtils.where('Iteration', '=', iterationRef);

        const response = await this.fetchListOfItems('artifact/groupby/flowstate', ['Name', 'Items'], {
            pageSize: 10,
            query,
            kwargs: {
                compact: false,
                itempagesize: 50,
                itemstart: 1,
                includeitems: true,
                itemfetch: ARTIFACT_SEARCH_FIELDS.join(","),
                itemquery: itemQuery.toQueryString(),
                itemorder: "FormattedID",
                // NOTE: using 'artifact' or 'task' doesn't work here. Maybe tasks don't have flow state?
                itemtypes: "defect,hierarchicalRequirement"
            },
            order: "OrderIndex ASC"
        });

        return response.items;
    }

    async getCurrentAndPreviousIterations(projectRef: Ref | string, now: DateTime) {
        const dateStr = now.toISO();
        let query = queryUtils.where('Project', '=', projectRef);
        query = query.and('StartDate', '<=', dateStr);

        const response = await this.fetchListOfItems('iteration', ITERATION_SEARCH_FIELDS, {
            order: "StartDate DESC",
            pageSize: 2,
            query,
        });
        const items: Iteration[] = response.items;
        return items;
    }

    async searchEpics(projectRef: Ref | string, searchStr: string) {
        let query = queryUtils.where('Project', '=', projectRef);

        if (searchStr) {
            let subQuery = queryUtils.where('FormattedID', 'contains', searchStr)
            subQuery = subQuery.or('Name', 'contains', searchStr);
            query = query.and(subQuery);
        }

        const response = await this.fetchListOfItems('artifact', ['Name', 'FormattedID'], {
            kwargs: {types: "portfolioitem/epic"},
            pageSize: 20,
            order: "FormattedID",
            query,
        });

        const items: Artifact[] = response.items;
        return items;
    }

    async searchProjects(searchStr: string) {
        let query;

        if (searchStr) {
            query = queryUtils.where('Name', 'contains', searchStr);
        }

        const response = await this.fetchListOfItems('project', ['Name', 'Description'], {
            pageSize: 100,
            order: "Name",
            query,
        });

        const items: Project[] = response.items;
        return items;
    }

    async searchReleases(projectRef: Ref | string, searchStr: string) {
        if (!projectRef) {
            return [];
        }

        let query = queryUtils.where('Project', '=', projectRef);

        if (searchStr) {
            query = query.and('Name', 'contains', searchStr);
        }

        const response = await this.fetchListOfItems('release', ['Name'], {
            pageSize: 20,
            order: "Name",
            query,
        });

        const items: Release[] = response.items;
        return items;
    }

    async searchIterations(projectRef: Ref | string, searchStr: string) {
        if (!projectRef) {
            return [];
        }

        let query = queryUtils.where('Project', '=', projectRef);

        if (searchStr) {
            query = query.and('Name', 'contains', searchStr);
        }

        const response = await this.fetchListOfItems('iteration', ['Name'], {
            pageSize: 20,
            order: "StartDate",
            query,
        });

        const items: Iteration[] = response.items;
        return items;
    }

    async searchProjectTeamMembers(projectRef: Ref | string, search: string) {
        // https://rally1.rallydev.com/slm/webservice/v2.0/project/XXX/TeamMembers
        if (!projectRef) {
            return [];
        }

        const projectId = refUtils.getId(projectRef);
        const typeStr = `project/${projectId}/TeamMembers`;
        let query;

        if (search) {
            query = queryUtils.where('DisplayName', 'contains', search || null);
        }

        const response = await this.fetchListOfItems(typeStr, ['Name'], {
            pageSize: 20,
            order: "DisplayName",
            query
        });
        const items: TeamMember[] = response.items;
        return items;
    }

    async searchFlowStates(projectRef: Ref | string, search: string) {
        let query = queryUtils.where('Project', '=', projectRef);

        if (search) {
            query = query.and('Name', 'contains', search);
        }

        const response = await this.fetchListOfItems('flowstate', ['ScheduleStateMapping', 'Name'],{
            pageSize: 20,
            query,
            order: "OrderIndex"
        });
        const items: FlowState[] = response.items;
        return items;
    }

    async fetchComments(itemRef: string) {
        const query = queryUtils.where('Artifact', '=', itemRef);
        const results = await this.fetchListOfItems('conversationPost', COMMENT_SEARCH_FIELDS,
            {query, pageSize: 100});
        const items: Comment[] = results.items;
        return items;
    }

    async fetchRevisionHistory(revisionHistoryRef: Ref) {
        if (!revisionHistoryRef) {
            return [];
        }

        // filter out comments, and some other things we don't need
        const query = queryUtils.where('RevisionHistory', '=', revisionHistoryRef)
            .and('Description', '!contains', 'DISCUSSION')
            .and('Description', '!=', 'Original revision')
            .and('Description', '!contains', 'ATTACHMENTS')
            // NOTE: this one is weird, it's actually the comment text changing and not the Artifact. Investigate
            .and('Description', '!contains', 'TEXT');

        const result = await this.fetchListOfItems("revision", REVISION_SEARCH_FIELDS, {query, pageSize: 100});
        return result.items;
    }

    async fetchAttachments(itemRef: string) {
        const query = queryUtils.where('Artifact', '=', itemRef);

        const results = await this.fetchListOfItems('attachment', ATTACHMENT_SEARCH_FIELDS, {query, pageSize: 100});
        const items: Attachment[] = results.items;
        return items;
    }

    async fetchAttachmentContent(attachment: Attachment) {
        const contentRef = attachment.Content;
        const contentType = attachment.ContentType;
        const result = await this.fetchSingleItemByRef(contentRef._ref);
        // NOTE: doesn't already have a prefix for some reason
        const prefix = `data:${contentType};base64, `;
        return  prefix + result['Content'];
    }

    async fetchUserProfileImage(user: User) {
        const profileImageRef = user.ProfileImage?._ref;
        if (!profileImageRef) {
            return null;
        }

        const result = await this.fetchSingleItemByRef(profileImageRef);
        // NOTE: doesn't already have a prefix for some reason
        const prefix = "data:image/png;base64, ";
        user.userProfileImage = prefix + result['Content'];
        return user.userProfileImage;
    }

    async fetchDefaultProject(user: User) {
        const defaultProjectRef = user.DefaultProject._ref;
        const project: Project = await this.fetchSingleItemByRef(defaultProjectRef);
        user.defaultProject = project;
        return project;
    }

    async fetchSingleItemByFormattedID(formattedID: string) {
        console.assert(formattedID != null);

        const query = queryUtils.where('FormattedID', '=', formattedID);

        const results = await this.fetchListOfItems('artifact', ['ObjectID', 'FormattedID'], {query});
        let items = results.items;

        // NOTE: formattedIDS are in this format: 'US12345' or 'TR67890'
        // NOTE: the search by FormattedID only compares the digits and ignores the prefix so we may get extra results
        // NOTE: we just need to find the one that matches our FormattedID and return it
        items = items.filter((item: any) => (item.FormattedID === formattedID));
        const item: Artifact = items.length > 0 ? items[0] : null;

        if (!item) {
            throw new NotFoundError(`Unable to find item with id: '${formattedID}'`);
        }

        // NOTE: do a second fetch to get back all the fields now that we know the item type
        const result: Artifact = await this.fetchSingleItemByRef(item._ref);
        return result;
    }
}
