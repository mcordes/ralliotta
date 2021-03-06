import {Ref} from "./Ref";

export interface Revision {
    Description: string;
    RevisionNumber: any;
    User: Ref;
    CreationDate: Date;
}

export const REVISION_SEARCH_FIELDS: Array<keyof Revision> = ['Description', 'RevisionNumber', 'User', 'CreationDate'];
