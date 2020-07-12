import {Ref} from "./Ref";
import {Project} from "./Project";

export interface User extends Ref {
    UserName: string;
    FirstName: string;
    LastName: string;
    DisplayName: string;
    EmailAddress: string;
    ProfileImage: Ref;
    DefaultProject: Ref;

    // avatar image in types
    userProfileImage?: string;

    // The entire project object, not the ref like above
    defaultProject?: Project;
    
    /*
    All user fields:
    [DefaultDetailPageToViewingMode, UserName, Errors, _rallyAPIMinor, FirstName, LastName, ArtifactsOwned, _refObjectName, c_DevStatus, Planner, Role, LastSystemTimeZoneName, Department, _objectVersion, _ref, PasswordExpires, UserProfile, ProfileImage, ProjectScopeUp, TeamMemberships, Phone, Deleted, AccountLockedUntil, LastPasswordUpdateDate, ObjectUUID, WorkspacePermission, MiddleName, OfficeLocation, OnpremLdapUsername, ShortDisplayName, c_APPSUPDRIGHTS, _refObjectUUID, DisplayName, Subscription, InvestmentAdmin, LastActiveDate, Language, DateFormat, _rallyAPIMajor, SubscriptionAdmin, DefaultProject, SessionTimeoutWarning, UserPermissions, CostCenter, sessionTimeout, EmailNotificationEnabled, SubscriptionID, SubscriptionPermission, NetworkID, LandingPage, ObjectID, ArtifactsCreated, Locale, Warnings, ProjectScopeDown, Disabled, _CreatedAt, VersionId, EmailAddress, LastLoginDate, DateTimeFormat, ZuulID, RevisionHistory, CreationDate]
     */
}
