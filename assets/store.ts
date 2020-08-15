import {User} from "./types/User";
import {toStringOrBlank} from "./utils/util";
import {config} from "./config";

const USERNAME_STORAGE_KEY = config.useMockRallyAPI ? "sampleUsername" : "username";
const SESSION_ID_STORAGE_KEY = config.useMockRallyAPI ? "sampleSessionId" : "sessionId";
const SECURITY_TOKEN_STORAGE_KEY = config.useMockRallyAPI ? "sampleSecurityToken" : "securityToken";

const username = localStorage.getItem(USERNAME_STORAGE_KEY);
const sessionId = localStorage.getItem(SESSION_ID_STORAGE_KEY);
const securityToken = localStorage.getItem(SECURITY_TOKEN_STORAGE_KEY);

export interface Credentials {
    username: string;
    sessionId: string;
    securityToken: string;
}

interface State {
    _user: User | null;
    _username: string;
    _sessionId: string;
    _securityToken: string;
}

const _state: State = {
    _user: null,
    _username: toStringOrBlank(username),
    _sessionId: toStringOrBlank(sessionId),
    _securityToken: toStringOrBlank(securityToken),
};


export default {
    state: _state,
    isLoggedIn() {
        return this.state._user != null;
    },

    setCredentials(username: string, password: string, sessionId: string, securityToken: string) {
        this.state._username = toStringOrBlank(username);
        this.state._sessionId = toStringOrBlank(sessionId);
        this.state._securityToken = toStringOrBlank(securityToken);

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
        if (config.useMockRallyAPI) {
            return true;
        }

        const c = this.getCredentials();
        return !!(c.username && c.sessionId && c.securityToken);
    },

    setUser(user: User) {
        this.state._user = user;
    },

    getUser(): User {
        return this.state._user!;
    },

    clearUser() {
        this.state._sessionId = '';
        this.state._securityToken = '';
        this.state._user = null;

        localStorage.removeItem(USERNAME_STORAGE_KEY);
        localStorage.removeItem(SESSION_ID_STORAGE_KEY);
        localStorage.removeItem(SECURITY_TOKEN_STORAGE_KEY);
    }

};
