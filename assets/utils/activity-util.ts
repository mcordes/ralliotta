import {Ref} from "../types/Ref";
import {orderBy} from "lodash";
import {fetchListOfItems, fetchSingleItemByRef, queryUtils, refUtils} from "./rally-util";
import {Artifact} from "../types/Artifact";
import {Attachment, ATTACHMENT_SEARCH_FIELDS} from "../types/Attachment";
import {COMMENT_SEARCH_FIELDS, Comment} from "../types/Comment";
import {REVISION_SEARCH_FIELDS} from "../types/Revision";

export type ActivityType = "comment" | "revision" | "attachment";

export interface ActivityItem {
    type: ActivityType,
    data: any;
    date: Date;
    userName: string;
    userAvatarURL: string;
}

export async function getActivityForItem(item: Artifact) {
    const revisionHistoryRef = item.RevisionHistory;
    const activity: ActivityItem[] = [];

    // TODO-mrc error handling
    const [comments, revisions, attachments] = await Promise.all([
        fetchComments(item._ref),
        fetchRevisionHistory(revisionHistoryRef),
        fetchAttachments(item._ref)
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

export function toActivityItem(thing: any, type: ActivityType) {
    const result: ActivityItem = {
        type: type,
        data: thing,
        date: thing.CreationDate,
        userName: thing.User._refObjectName,
        userAvatarURL: getUserAvatarURL(thing.User)
    };
    return result;
}

async function fetchComments(itemRef: string) {
    const query = queryUtils.where('Artifact', '=', itemRef);
    const results = await fetchListOfItems('conversationPost', COMMENT_SEARCH_FIELDS,
        {query, pageSize: 100});
    const items: Comment[] = results.items;
    return items;
}

async function fetchRevisionHistory(revisionHistoryRef: Ref) {
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

    const result = await fetchListOfItems("revision", REVISION_SEARCH_FIELDS, {query, pageSize: 100});
    return result.items;
}

async function fetchAttachments(itemRef: string) {
    const query = queryUtils.where('Artifact', '=', itemRef);

    const results = await fetchListOfItems('attachment', ATTACHMENT_SEARCH_FIELDS, {query, pageSize: 100});
    const items: Attachment[] = results.items;
    return items;
}


export async function fetchAttachmentContent(attachment: Attachment) {
    const contentRef = attachment.Content;
    const contentType = attachment.ContentType;
    const result = await fetchSingleItemByRef(contentRef._ref);
    // NOTE: doesn't already have a prefix for some reason
    const prefix = `data:${contentType};base64, `;
    return  prefix + result['Content'];
}

export function getUserAvatarURL(userRef: Ref) {
    return '';

    // TODO-mrc: this doesn't work. You need to be logged into rally to hit this endpoint. Try again.
    /*
    const objectId = refUtils.getId(userRef._ref);

    // The size seems to pretty adjustable here. Just change the # at the end
    const imageSize = 50;
    return `https://rally1.rallydev.com/slm/profile/image/${objectId}/${imageSize}.sp`;
     */
}
