import {Ref} from "./Ref";

export interface Comment extends Ref {
    Name: string;
    PostNumber: number;
    Text: string;
    User: Ref;
    CreationDate: Date;
    Artifact: Ref;

    // TODO-mrc: is tihs really part of this model?
    FormattedID: string;
}


export const COMMENT_SEARCH_FIELDS: Array<keyof Comment> = ['Name', 'PostNumber', 'Text', 'User', 'CreationDate', 'Artifact', 'FormattedID'];
