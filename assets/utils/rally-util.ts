import store, {Credentials} from "../store";
// @ts-ignore
import rally from 'rally';
import {Artifact, ARTIFACT_SEARCH_FIELDS} from "../types/Artifact";
import {SelectOption} from "../types/SelectOption";
import {FlowState} from "../types/FlowState";
import {Ref} from "../types/Ref";
import {Project} from "../types/Project";
import {Iteration, ITERATION_SEARCH_FIELDS} from "../types/Iteration";
import {Release} from "../types/Release";
import {DateTime} from "luxon";
import {AuthenticationError, NotFoundError} from "../exceptions";
import {TeamMember} from "../types/TeamMember";
import {User} from "../types/User";

export const queryUtils = rally.util.query;
export const refUtils = rally.util.ref;

export function getRallyAPI(credentials: Credentials) {
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

export function validateRallyResponseOrThrow(resp: any) {
    const errors = resp['Errors'];
    if (resp['Errors'].lenth > 0) {
        const msg = `Request failed with the following error: ${JSON.stringify(errors)}`;
        console.log(msg);
        throw new Error(msg)
    }
}

export async function fetchSingleItemByRef(ref: string) {
    console.assert(ref != null);

    const resp = await getRallyAPI(store.getCredentials()).get({
        ref: ref,
    });

    validateRallyResponseOrThrow(resp);

    return resp.Object;
}

export const fetchSingleItemByFormattedID = async (formattedID: string) => {
    console.assert(formattedID != null);

    const query = queryUtils.where('FormattedID', '=', formattedID);

    const results = await fetchListOfItems('artifact', ['ObjectID', 'FormattedID'], {query});
    let items = results.items;

    // NOTE: formattedIDS are in this format: 'US12345' or 'TR67890'
    // NOTE: the search by FormattedID only compares the digits and ignores the prefix so we may get extra results
    // NOTE: we just need to find the one that matches our FormattedID and return it
    items = items.filter(item => (item.FormattedID === formattedID));
    const item: Artifact = items.length > 0 ? items[0] : null;

    if (!item) {
        throw new NotFoundError(`Unable to find item with id: '${formattedID}'`);
    }

    // NOTE: do a second fetch to get back all the fields now that we know the item type
    const result: Artifact = await fetchSingleItemByRef(item._ref);
    return result;
}

export interface SearchResults {
    items: any[];
    hasMoreResults: boolean;
    totalRecords: number;
}

export interface ListOptions {
    query?: string;
    startIndex?: number;
    pageSize?: number;
    order?: string;
    kwargs?: {[key: string]: any}
    projectScope?: Project | Ref;
}

interface Scope {
    project?: string;

    // NOTE: the up/down has to do with the way Rally does project hierarchy searches. Hopefully we can ignore
    // this in most cases.
    up?: boolean;
    down?: boolean;
}

export async function fetchListOfItems(type: string, fields: string[], options: ListOptions) {
    console.assert(type != null);
    console.assert(fields != null);
    const scope: Scope = {};
    if (options.projectScope) {
        scope.project = options.projectScope._ref;
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

export interface AddUpdateFieldData {
    [key: string]: string | boolean | number | null
}

function getAddUpdateRequestOptions() {
    // NOTE: updates / adds require we also pass the security token. GETs don't need it.
    return {
        qs: {
            key: store.getCredentials().securityToken,
        }
    };
}

export async function updateItem(ref: string, data: AddUpdateFieldData) {
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

export async function createItem(type: string, data: AddUpdateFieldData) {
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

export async function getSelectOptionsFromRefs(items: Ref[]) {
    const results: SelectOption[] = items.map(r => { return {value: r._ref, label: r._refObjectName}; });
    return results;
}

export async function getArtifactsGroupedByFlowState(projectRef: Ref | string, iterationRef: Ref) {
    const query = queryUtils.where('Project', '=', projectRef);
    const itemQuery = queryUtils.where('Iteration', '=', iterationRef);

    const response = await fetchListOfItems('artifact/groupby/flowstate', ['Name', 'Items'], {
        pageSize: 10,
        query,
        kwargs: {
            compact: false,
            itempagesize: 50,
            itemstart: 1,
            includeitems: true,
            itemfetch: ARTIFACT_SEARCH_FIELDS.join(","),
            itemquery: itemQuery.toQueryString(),
            itemorder: "FormattedID",
            // NOTE: using 'artifact' or 'task' doesn't work here. Maybe tasks don't have flow state?
            itemtypes: "defect,hierarchicalRequirement"
        },
        order: "OrderIndex ASC"
    });

    return response.items;
}

export async function getCurrentAndPreviousIterations(projectRef: Ref | string, now: DateTime) {
    const dateStr = now.toISO();
    let query = queryUtils.where('Project', '=', projectRef);
    query = query.and('StartDate', '<=', dateStr);

    const response = await fetchListOfItems('iteration', ITERATION_SEARCH_FIELDS, {
        order: "StartDate DESC",
        pageSize: 2,
        query,
    });
    const items: Iteration[] = response.items;
    return items;
}

export async function searchEpics(projectRef: Ref | string, searchStr: string) {
    let query = queryUtils.where('Project', '=', projectRef);

    if (searchStr) {
        let subQuery = queryUtils.where('FormattedID', 'contains', searchStr)
        subQuery = subQuery.or('Name', 'contains', searchStr);
        query = query.and(subQuery);
    }

    const response = await fetchListOfItems('artifact', ['Name', 'FormattedID'], {
        kwargs: {types: "portfolioitem/epic"},
        pageSize: 20,
        order: "FormattedID",
        query,
    });

    const items: Artifact[] = response.items;
    return items;
}

export async function searchProjects(searchStr: string) {
    let query;

    if (searchStr) {
        query = queryUtils.where('Name', 'contains', searchStr);
    }

    const response = await fetchListOfItems('project', ['Name', 'Description'], {
        pageSize: 100,
        order: "Name",
        query,
    });

    const items: Project[] = response.items;
    return items;
}

export async function searchReleases(projectRef: Ref | string, searchStr: string) {
    if (!projectRef) {
        return [];
    }

    let query = queryUtils.where('Project', '=', projectRef);

    if (searchStr) {
        query = query.and('Name', 'contains', searchStr);
    }

    const response = await fetchListOfItems('release', ['Name'], {
        pageSize: 20,
        order: "Name",
        query,
    });

    const items: Release[] = response.items;
    return items;
}

export async function searchIterations(projectRef: Ref | string, searchStr: string) {
    if (!projectRef) {
        return [];
    }

    let query = queryUtils.where('Project', '=', projectRef);

    if (searchStr) {
        query = query.and('Name', 'contains', searchStr);
    }

    const response = await fetchListOfItems('iteration', ['Name'], {
        pageSize: 20,
        order: "StartDate",
        query,
    });

    const items: Iteration[] = response.items;
    return items;
}

export async function searchProjectTeamMembers(projectRef: Ref | string, search: string, user: User) {
    // https://rally1.rallydev.com/slm/webservice/v2.0/project/XXX/TeamMembers
    if (!projectRef) {
        return [];
    }

    const projectId = refUtils.getId(projectRef);
    const typeStr = `project/${projectId}/TeamMembers`;
    let query;

    if (search) {
        query = queryUtils.where('DisplayName', 'contains', search || null);
    }

    const response = await fetchListOfItems(typeStr, ['Name'], {
        pageSize: 20,
        order: "DisplayName",
        query
    });
    const items: TeamMember[] = response.items;

    if (!search || user.DisplayName.toLowerCase().indexOf(search.toLowerCase()) !== -1) {
        // Note: the current user isn't in the results above. Add us in now.
        const theUser: TeamMember = {
            DisplayName: user.DisplayName,
            EmailAddress: user.EmailAddress,
            UserName: user.UserName,
            _refObjectName: user._refObjectName,
            _ref: user._ref,
            _type: user._type
        }

        items.unshift(theUser);
    }
    return items;
}

export async function searchFlowStates(projectRef: Ref | string, search: string) {
    let query = queryUtils.where('Project', '=', projectRef);

    if (search) {
        query = query.and('Name', 'contains', search);
    }

    const response = await fetchListOfItems('flowstate', ['ScheduleStateMapping', 'Name'],{
        pageSize: 20,
        query,
        order: "OrderIndex"
    });
    const items: FlowState[] = response.items;
    return items;
}
