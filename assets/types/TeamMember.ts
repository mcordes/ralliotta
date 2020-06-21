import {Ref} from "./Ref";
import {Project} from "./Project";


// TODO-mrc: is this endpoint really just returning user objects? do we need this?
export interface TeamMember extends Ref {
    DisplayName: string;
    EmailAddress: string;
    UserName: string;

    // NOTE: the _ref for this object is the ref for a user, e.g. https://rally1.rallydev.com/slm/webservice/v2.0/user/XXX
}
