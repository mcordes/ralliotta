import {Ref} from "./Ref";

export interface Comment extends Ref {
    Name: string;
    PostNumber: number;
    Text: string;
    User: Ref;
    CreationDate: Date;
}

export const COMMENT_SEARCH_FIELDS = ['Name', 'PostNumber', 'Text', 'User', 'CreationDate'];
