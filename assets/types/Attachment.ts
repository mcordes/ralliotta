import {Ref} from "./Ref";

export interface Attachment {
    CreationDate: Date;
    Content: Ref;
    ContentType: string;
    Name: string;
    User: Ref;
}

export const ATTACHMENT_SEARCH_FIELDS: Array<keyof Attachment> = ['CreationDate', 'Content', 'ContentType', 'Name', 'User'];
