// TODO-mrc: fix me
const foo: any = null; // TODO-mrc: UserType | null = null;

const USERNAME_STORAGE_KEY = "username";
const SESSION_ID_STORAGE_KEY = "sessionId";
const SECURITY_TOKEN_STORAGE_KEY = "securityToken";

const username = localStorage.getItem(USERNAME_STORAGE_KEY);
const sessionId = localStorage.getItem(SESSION_ID_STORAGE_KEY);
const securityToken = localStorage.getItem(SECURITY_TOKEN_STORAGE_KEY);

export interface Credentials {
    username: string;
    sessionId: string;
    securityToken: string;
}

function toString(s: string | null) {
    return s ? s : "";
}

export default {
    state: {
        user: foo,
        _username: toString(username),
        _sessionId: toString(sessionId),
        _securityToken: toString(securityToken),
    },

    isLoggedIn() {
        return this.state.user != null;
    },

    setCredentials(username: string, password: string, sessionId: string, securityToken: string) {
        this.state._username = toString(username);
        this.state._sessionId = toString(sessionId);
        this.state._securityToken = toString(securityToken);

        localStorage.setItem(USERNAME_STORAGE_KEY, username);
        localStorage.setItem(SESSION_ID_STORAGE_KEY, sessionId);
        localStorage.setItem(SECURITY_TOKEN_STORAGE_KEY, securityToken);
    },

    getCredentials(): Credentials {
        return {
            username: this.state._username,
            sessionId: this.state._sessionId,
            securityToken: this.state._securityToken
        };
    },

    hasCredentials() {
        const c = this.getCredentials();
        return c.username && c.sessionId && c.securityToken;
    },

    // TODO: use UserType if possible; fix me
    setUser(user: any) {
        this.state.user = user;
    },

    clearUser() {
        this.state._sessionId = '';
        this.state._securityToken = '';
        this.state.user = null;

        localStorage.removeItem(USERNAME_STORAGE_KEY);
        localStorage.removeItem(SESSION_ID_STORAGE_KEY);
        localStorage.removeItem(SECURITY_TOKEN_STORAGE_KEY);
    }

};
