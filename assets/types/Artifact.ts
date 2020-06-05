import {Ref} from "./Ref";

export interface Artifact extends Ref {
    Name: string;
    Description: string;
    FormattedID: string;
    CreationDate: Date;
    LastUpdateDate: Date;
    Iteration: any;
    Release: any;
    Owner: any;
    CreatedBy: any;
    ScheduleState: any;
    FlowState: Ref;
    Attachments: Ref;
    Project: Ref;
    RevisionHistory: Ref;
    Parent: Ref;


    /*
    Defect fields - [TestCaseCount, Errors, Severity, FixedInBuild, Workspace, _ref, InProgressDate, ClosedDate, Warnings, AcceptedDate, VerifiedInBuild, Milestones, FoundInBuild, TaskActualTotal, Iteration, TaskStatus, TestCaseStatus, Release, ObjectID, Duplicates, Connections, VersionId, Ready, FormattedID, _rallyAPIMinor, BlockedReason, Priority, State, TargetBuild, PlanEstimate, TargetDate, _CreatedAt, SalesforceCaseID, SalesforceCaseNumber, Subscription, Changesets, ReleaseNote, PassingTestCaseCount, LastBuild, LatestDiscussionAgeInMinutes, OpenedDate, Tasks, FlowState, DisplayColor, Blocker, CreatedBy, Owner, RevisionHistory, Blocked, _objectVersion, c_JiraKey, Discussion, Environment, TestCaseResult, TaskRemainingTotal, ScheduleStatePrefix, Tags, DefectSuites, SubmittedBy, c_Components, AffectsDoc, _rallyAPIMajor, LastUpdateDate, TestCases, Resolution, Requirement, Attachments, Recycled, ScheduleState, FlowStateChangedDate, _refObjectName, TaskEstimateTotal, DragAndDropRank, Description, ObjectUUID, TestCase, c_DeploymentStatus, _refObjectUUID, Notes, Expedite, c_JIRALink, Name, Package, LastRun, Project, CreationDate]
     */

}

// TODO-mrc: there's no better way than this?
export const ARTIFACT_SEARCH_FIELDS: Array<keyof Artifact> = ['FormattedID', 'Name', 'Owner', 'Project', 'Release',
    'Iteration', 'CreationDate', 'Parent', 'Description', 'ScheduleState', 'FlowState', 'CreationDate', 'CreatedBy',
    'LastUpdateDate'];

export const COMMENT_SEARCH_FIELDS = ['Name', 'PostNumber', 'Text', 'User', 'CreationDate'];

export const REVISION_SEARCH_FIELDS = ['Description', 'RevisionNumber', 'User', 'CreationDate'];
