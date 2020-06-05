export interface Ref {
    _ref: string;

    // NOTE: this is the username when this a user ref and the defect title when it's a
    // defect ref
    _refObjectName: string;
    _type: string;
}
