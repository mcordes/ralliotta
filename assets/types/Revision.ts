import {Ref} from "./Ref";
import {Comment} from "./Comment";

export interface Revision {
    Description: string;
    RevisionNumber: any;
    User: Ref;
    CreationDate: Date;
}

export const REVISION_SEARCH_FIELDS: Array<keyof Revision> = ['Description', 'RevisionNumber', 'User', 'CreationDate'];
