import {Ref} from "./Ref";

export interface Project extends Ref {
    Name: string;
    Description: string;

    /*
    All project fields
    [c_Type, Errors, _rallyAPIMinor, _refObjectName, State, _objectVersion, _ref, Description, Releases, Warnings, _CreatedAt, ObjectUUID, _refObjectUUID, Subscription, Name, _rallyAPIMajor, Notes, BuildDefinitions, Workspace, SchemaVersion, Parent, ObjectID, TeamMembers, VersionId, Iterations, Owner, RevisionHistory, CreationDate, Children]
     */
}
