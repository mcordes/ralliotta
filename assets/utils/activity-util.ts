import {Ref} from "../types/Ref";
import {orderBy} from "lodash";
import {fetchListOfItems, fetchSingleItemByRef, queryUtils} from "./rally-util";
import {Artifact, COMMENT_SEARCH_FIELDS, REVISION_SEARCH_FIELDS} from "../types/Artifact";
import {Attachment, ATTACHMENT_SEARCH_FIELDS} from "../types/Attachment";
import {User} from "../types/User";

export interface ActivityItem {
    type: "comment" | "revision" | "attachment",
    data: any;
    date: Date;
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
        activity.push({type: "comment", data: comment, date: comment.CreationDate})
    }

    for (const revision of revisions) {
        activity.push({type: "revision", data: revision, date: revision.CreationDate})
    }

    for (const attachment of attachments) {
        activity.push({type: "attachment", data: attachment, date: attachment.CreationDate})
    }

    return orderBy(activity, ['date']);
}


async function fetchComments(itemRef: string) {
    const query = queryUtils.where('Artifact', '=', itemRef);
    const results = await fetchListOfItems('conversationPost', COMMENT_SEARCH_FIELDS,
        {query, pageSize: 100});
    return results.items;
}

async function fetchRevisionHistory(revisionHistoryRef: Ref) {
    if (!revisionHistoryRef) {
        return [];
    }

    // TODO-mrc: make this better
    // filter out comments, and some other things we don't need
    const query = queryUtils.where('RevisionHistory', '=', revisionHistoryRef)
        .and('Description', '!contains', 'DISCUSSION')
        .and('Description', '!=', 'Original revision')
        .and('Description', '!contains', 'ATTACHMENTS');

    const result = await fetchListOfItems("revision", REVISION_SEARCH_FIELDS, {query, pageSize: 100});
    return result.items;
}

async function fetchAttachments(itemRef: string) {
    const attachments: Attachment[] = [];
    const query = queryUtils.where('Artifact', '=', itemRef);

    const results = await fetchListOfItems('attachment', ATTACHMENT_SEARCH_FIELDS, {query, pageSize: 100});
    return results.items;
}


export async function fetchAttachmentContent(attachment: Attachment) {
    const contentRef = attachment.Content;
    const contentType = attachment.ContentType;
    const result = await fetchSingleItemByRef(contentRef._ref);
    // NOTE: doesn't already have a prefix for some reason
    const prefix = `data:${contentType};base64, `;
    return  prefix + result['Content'];
}
