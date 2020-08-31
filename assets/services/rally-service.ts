import store, {Credentials} from "../store";
// @ts-ignore
import rally from 'rally';
import {config} from "../config";
import {Ref} from "../types/Ref";
import {AuthenticationError} from "../exceptions";
import {User} from "../types/User";
import {AddUpdateFieldData, ListOptions, Scope, SearchResults, Service} from "./service";
import {refUtils} from "../utils/util";

function getRallyAPI(credentials: Credentials) {
    const restApi = rally({
        // NOTE: this is probably more static than you want / think. Be careful.
        apiKey: credentials.sessionId,
        requestOptions: {
            headers: {},
        }
    });

    const execOperation = (fn: (options: any) => any, options: any) => {
        try {
            return fn.bind(restApi)(options);
        }
        catch (e) {
            if (e.message === "Error: no auth mechanism defined" || e.message.indexOf('Error 401') !== -1) {
                throw new AuthenticationError();
            }
            throw e;
        }
    }

    const api = {
        create: async (options: any) => {
            return execOperation(restApi.create, options);
        },
        query: async (options: any) => {
            return execOperation(restApi.query, options);
        },
        get: async (options: any) => {
            return execOperation(restApi.get, options);
        },
        add: async (options: any) => {
            return execOperation(restApi.add, options);
        },
        del: async (options: any) => {
            return execOperation(restApi.del, options);
        },
        update: async (options: any) => {
            return execOperation(restApi.update, options);
        },
    };

    return api;
}

function validateRallyResponseOrThrow(resp: any) {
    const errors = resp['Errors'];
    if (resp['Errors'].lenth > 0) {
        const msg = `Request failed with the following error: ${JSON.stringify(errors)}`;
        console.log(msg);
        throw new Error(msg)
    }

    // TODO: these are effectively errors as well in most cases, maybe throw on these too?
    if (resp['Warnings'].length > 0) {
        for (const warning of resp['Warnings']) {
            console.log("Rally Warning: " + warning);
        }
    }
}

function getAddUpdateRequestOptions() {
    // NOTE: updates / adds require we also pass the security token. GETs don't need it.
    return {
        qs: {
            key: store.getCredentials().securityToken,
        }
    };
}

export class RallyService extends Service {
    async fetchCurrentUser() {
        // NOTE: Looking for users without a query parameter string returns a single user - the logged in user
        const resp = await getRallyAPI(store.getCredentials()).query({
            type: 'user',
            start: 1, // 1-based
            pageSize: 2,
            limit: 2,
        });

        validateRallyResponseOrThrow(resp);

        // NOTE: The result isn't wrapped with a top level element like the others
        const user: User = resp;

        await Promise.all([
            this.fetchDefaultProject(user),
            this.fetchUserProfileImage(user),
        ]);

        return user;
    }

    async login(username: string, password: string) {
        const response = await fetch(config.userLookupURL,
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

    async fetchSingleItemByRef(ref: string | Ref) {
        console.assert(ref != null);

        const resp = await getRallyAPI(store.getCredentials()).get({
            ref: ref,
        });

        validateRallyResponseOrThrow(resp);

        return resp.Object;
    }

    async fetchListOfItems(type: string, fields: string[], options: ListOptions) {
        console.assert(type != null);
        console.assert(fields != null);
        const scope: Scope = {};
        if (options.projectScope) {
            scope.project = options.projectScope;
        }

        const resp = await getRallyAPI(store.getCredentials()).query({
            type: type,
            start: options.startIndex || 1, // 1-based
            pageSize: options.pageSize || 20,
            limit: options.pageSize || 20,

            fetch: fields,
            query: options.query,
            scope: scope,
            order: options.order,
            requestOptions: {
                qs: options.kwargs || {}
            }
        });

        validateRallyResponseOrThrow(resp);

        // NOTE: Groups is used by the grouping queries and results in the normal wrapping element
        const items = resp.Groups || resp.Results;

        const results: SearchResults = {
            items: items,
            hasMoreResults: resp.TotalResultCount > resp.Results.length,
            totalRecords: resp.TotalResultCount,
        }
        return results;
    }

    async updateItem(ref: string, data: AddUpdateFieldData) {
        console.assert(ref != null);
        console.assert(data != null);

        const credentials = store.getCredentials();
        const api = getRallyAPI(credentials);
        const fieldsToUpdate = Object.keys(data);

        const resp = await api.update({
            fetch: fieldsToUpdate,
            ref,
            data,
            requestOptions: getAddUpdateRequestOptions(),
        });

        validateRallyResponseOrThrow(resp);
        return resp.Object;
    }

    async createItem(type: string, data: AddUpdateFieldData) {
        console.assert(type != null);
        console.assert(data != null);

        const credentials = store.getCredentials();
        const api = getRallyAPI(credentials);
        const fieldsToAdd = Object.keys(data);

        const result = await api.create({
            type: type,
            data: data,
            fetch: fieldsToAdd,
            requestOptions: getAddUpdateRequestOptions(),
        });

        return result.Object;
    }

    getAvatarImageURL(user: User | Ref, size: number): string {
        const userObjectId = refUtils.getId(user._ref);
        const sessionId = store.getCredentials().sessionId;
        size = size || 43;
        return `${config.avatarURL}?oid=${userObjectId}&sid=${sessionId}&size=${size}`;
    }
}
