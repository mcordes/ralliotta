import {Ref} from "./Ref";

export interface Artifact extends Ref {
    Name: string;
    Description: string;
    CreationDate: Date;
    Iteration: any;
    Owner: any;
    CreatedBy: any;
    SheduledState: any;
    FlowState: Ref;
    Attachments: any;
    Project: Ref;
    RevisionHistory: Ref;

    /*
    Defect fields - [TestCaseCount, Errors, Severity, FixedInBuild, Workspace, _ref, InProgressDate, ClosedDate, Warnings, AcceptedDate, VerifiedInBuild, Milestones, FoundInBuild, TaskActualTotal, Iteration, TaskStatus, TestCaseStatus, Release, ObjectID, Duplicates, Connections, VersionId, Ready, FormattedID, _rallyAPIMinor, BlockedReason, Priority, State, TargetBuild, PlanEstimate, TargetDate, _CreatedAt, SalesforceCaseID, SalesforceCaseNumber, Subscription, Changesets, ReleaseNote, PassingTestCaseCount, LastBuild, LatestDiscussionAgeInMinutes, OpenedDate, Tasks, FlowState, DisplayColor, Blocker, CreatedBy, Owner, RevisionHistory, Blocked, _objectVersion, c_JiraKey, Discussion, Environment, TestCaseResult, TaskRemainingTotal, ScheduleStatePrefix, Tags, DefectSuites, SubmittedBy, c_Components, AffectsDoc, _rallyAPIMajor, LastUpdateDate, TestCases, Resolution, Requirement, Attachments, Recycled, ScheduleState, FlowStateChangedDate, _refObjectName, TaskEstimateTotal, DragAndDropRank, Description, ObjectUUID, TestCase, c_DeploymentStatus, _refObjectUUID, Notes, Expedite, c_JIRALink, Name, Package, LastRun, Project, CreationDate]
     */


}
