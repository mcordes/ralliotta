import {fetchSingleItemByRef, getRallyAPI, validateRallyResponseOrThrow} from "../rally-util";
import {Model} from "./Model";
import {Project} from "./Project";
import store from "../store";

export class User extends Model {
    userProfileImage = "";
    defaultProject: Project | null = null;

    static async fetchCurrentUser() {
        // NOTE: Looking for users without a query string returns a single user - the logged in user
        const resp = await getRallyAPI(store.getCredentials()).query({
            type: 'user',
            start: 1, // 1-based
            pageSize: 2,
            limit: 2,
        });

        validateRallyResponseOrThrow(resp)

        // TODO-mrc: NOTE: there seems to be no wrapping Results element here. I wonder why.
        // TODO-mrc: validate # of results?
        const data = resp;
        const user = new User(data);

        // TODO-mrc: error handling
        await Promise.all([
            user.fetchDefaultProject(),
            user.fetchUserProfileImage(),
        ]);

        return user;
    }

    static async login(username: string, password: string) {

        // TODO-mrc: url for authorization proxy.
        const response = await fetch("http://localhost:8088/lookup",
            {
                method: "POST",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({username, password}),
            }
        );

        if (!response.ok) {
            // TODO-mrc: fix me
            console.log(`Error fetching current session - ${response.body}`);
            throw new Error("Error fetching current session ");
        }

        const result = await response.json()
        return {
            sessionId: result.sessionId,
            securityToken: result.securityToken
        }
    }

    async fetchUserProfileImage() {
        const profileImageRef = this.data.ProfileImage?._ref;
        const result = await fetchSingleItemByRef(profileImageRef);
        // NOTE: doesn't already have a prefix for some reason
        const prefix = "data:image/png;base64, ";
        this.userProfileImage = prefix + result['Content'];
        return this.userProfileImage;
    }

    async fetchDefaultProject() {
        const defaultProjectRef = this.data.DefaultProject._ref;
        const result = await fetchSingleItemByRef(defaultProjectRef);
        const project = new Project(result);
        this.defaultProject = project;
        return project;
    }

    getDefaultProjectID() {
        return this.data.DefaultProject._ref;
    }
}

// TODO-mrc:
// NOTE: ArtifactsOwned, and ArtifactsCreated looks interesting
