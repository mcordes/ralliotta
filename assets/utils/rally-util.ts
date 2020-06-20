import store, {Credentials} from "../store";
// @ts-ignore
import rally from 'rally';
import {Artifact, ARTIFACT_SEARCH_FIELDS} from "../types/Artifact";
import {SelectOption} from "../types/SelectOption";
import {FlowState} from "../types/FlowState";
import {Ref} from "../types/Ref";
import {Project} from "../types/Project";
import {Iteration} from "../types/Iteration";
import {Release} from "../types/Release";
import {DateTime} from "luxon";

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

    return restApi;
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

export const fetchSingleItemByFormattedID3 = async (formattedID: string) => {
    console.assert(formattedID != null);

    const query = queryUtils.where('FormattedID', '=', formattedID);

    const results = await fetchListOfItems('artifact', ['ObjectID', 'FormattedID'], {query});
    let items = results.items;

    // NOTE: formattedIDS are in this format: 'US12345' or 'TR67890'
    // NOTE: the search by FormattedID only compare the #s and ignores the prefixed so we may get extra results
    // NOTE: we just need to find the one that matches our FormattedID and return it
    items = items.filter(item => (item.FormattedID === formattedID));
    const item: Artifact = items.length > 0 ? items[0] : null;

    // TODO-mrc:
    if (!item) {
        // TODO-mrc: can I throw an exeption for a 404?
        throw new Error("implement me");
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
}

export async function fetchListOfItems(type: string, fields: string[], options: ListOptions) {
    console.assert(type != null);
    console.assert(fields != null);

    const resp = await getRallyAPI(store.getCredentials()).query({
        type: type,
        start: options.startIndex || 1, // 1-based
        pageSize: options.pageSize || 20,
        limit: options.pageSize || 20,

        //    order: 'Rank', // TODO-mrc
        fetch: fields,
        query: options.query,
        scope: {
            //        project: '/project/2345' //specify to query a specific project
            //        up: false //true to include parent project results, false otherwise
            //down: true //true to include child project results, false otherwise
        },
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
    // TODO-mrc: others?
    [key: string]: string | boolean | number
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

    // TODO-mrc: correct?
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

// TODO-mrc: cache me
export async function getFlowStateList(projectRef: Ref) {
    const query = queryUtils.where('Project', '=', projectRef);

    const response = await fetchListOfItems('flowstate', ['ScheduleStateMapping', 'Name'],{
        pageSize: 100,
        query,
        order: "OrderIndex"
    });
    const items: FlowState[] = response.items;
    return items;
}

export async function getProjectList() {
    const response = await fetchListOfItems('project', ['Name', 'Description'], {
        pageSize: 100,
        order: "Name"
    });
    const items: Project[] = response.items;
    return items;
}

// TODO-mrc: maybe filter out all but the previous old iterations?
export async function getIterationList(projectRef: Ref) {
    const query = queryUtils.where('Project', '=', projectRef);
    const response = await fetchListOfItems('iteration', ['Name', 'Description'], {
        pageSize: 100,
        query,
        order: "StartDate"
    });
    const items: Iteration[] = response.items;
    return items;
}

export async function getReleaseList(projectRef: Ref) {
    const query = queryUtils.where('Project', '=', projectRef);

    // TODO-mrc: ordering?
    // TODO-mrc: max size?
    // TODO-mrc: is there a way to just get 'current' releases?
    const response = await fetchListOfItems('release', ['Name'], {
        pageSize: 100,
        query,
    });
    const items: Release[] = response.items;
    return items;
}

export async function getSelectOptionsFromRefs(items: Ref[]) {
    const results: SelectOption[] = items.map(r => { return {value: r._ref, label: r._refObjectName}; });
    return results;
}

export async function getArtifactsGroupedByFlowState(projectRef: Ref, iterationRef: Ref) {
    // TODO-mrc: require a specific iteration also
    const query = queryUtils.where('Project', '=', projectRef);
    let itemQuery = queryUtils.where('Iteration', '=', iterationRef);

    const response = await fetchListOfItems('artifact/groupby/flowstate', ['Name', 'Items'], {
        pageSize: 10,
        query,
        kwargs: {
            compact: false,
            itempagesize: 5,
            itemstart: 1,
            includeitems: true,
            itemfetch: ARTIFACT_SEARCH_FIELDS.join(","),
            itemquery: itemQuery,
            itemorder: "FormattedID",
            // NOTE: using 'artifact' or 'task' doesn't work here. Maybe tasks don't have flow state?
            itemtypes: "defect,hierarchicalRequirement"
        },
        order: "OrderIndex ASC"
    });

    return response.items;
}


// TODO-mrc: this is returning wa too much data
export async function getCurrentIteration(projectRef: Ref) {
    const now = DateTime.utc();
    const dateStr = now.toISO();

    let query = queryUtils.where('Project', '=', projectRef);
    query = query.and('StartDate', '<=', dateStr);
    query = query.and('EndDate', '>=', dateStr);

    const response = await fetchListOfItems('iteration', ['Name', 'Description'], {
        order: "StartDate",
        query,
    });
    const items: Iteration[] = response.items;

    // TODO-mrc: what happens if there is no default iteration? can that happen?
    if (items.length > 0) {
        return items[0];
    }
}
