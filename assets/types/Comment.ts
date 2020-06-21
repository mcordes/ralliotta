import {Ref} from "./Ref";
import {Artifact} from "./Artifact";

export interface Comment extends Ref {
    Name: string;
    PostNumber: number;
    Text: string;
    User: Ref;
    CreationDate: Date;
    Artifact: Ref;
}

export const COMMENT_SEARCH_FIELDS = ['Name', 'PostNumber', 'Text', 'User', 'CreationDate', 'Artifact'];
