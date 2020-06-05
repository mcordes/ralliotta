import {fetchSingleItemByRef, getRallyAPI, validateRallyResponseOrThrow} from "./rally-util";
import store from "../store";
import {Project} from "../types/Project";
import {User} from "../types/User";

export async function fetchCurrentUser() {
    // NOTE: Looking for users without a query string returns a single user - the logged in user
    const resp = await getRallyAPI(store.getCredentials()).query({
        type: 'user',
        start: 1, // 1-based
        pageSize: 2,
        limit: 2,
    });

    validateRallyResponseOrThrow(resp)

    // NOTE: The result isn't wrapped with a top level element like the others
    const user: User = resp;

    // TODO-mrc: error handling
    await Promise.all([
        fetchDefaultProject(user),
        fetchUserProfileImage(user),
    ]);

    return user;
}


export async function login(username: string, password: string) {
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
        console.log(`Error fetching current session - ${response.body}`);
        throw new Error("Error fetching current session ");
    }

    const result = await response.json()
    return {
        sessionId: result.sessionId,
        securityToken: result.securityToken
    }
}

export async function fetchUserProfileImage(user: User) {
    const profileImageRef = user.ProfileImage?._ref;
    const result = await fetchSingleItemByRef(profileImageRef);
    // NOTE: doesn't already have a prefix for some reason
    const prefix = "data:image/png;base64, ";
    user.userProfileImage = prefix + result['Content'];
    return user.userProfileImage;
}

export async function fetchDefaultProject(user: User) {
    const defaultProjectRef = user.DefaultProject._ref;
    const project: Project = await fetchSingleItemByRef(defaultProjectRef);
    user.defaultProject = project;
    return project;
}
