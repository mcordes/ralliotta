import {Ref} from "./Ref";

export interface Comment extends Ref {
    Name: string;
    PostNumber: number;
    Text: string;
    User: Ref;
    CreationDate: Date;
    Artifact: Ref;

    // NOTE: this is actually an Artifact field, but can be included on comments (another undocumented API feature?)
    FormattedID: string;
}


export const COMMENT_SEARCH_FIELDS: Array<keyof Comment> = ['Name', 'PostNumber', 'Text', 'User', 'CreationDate',
    'Artifact', 'FormattedID'];
