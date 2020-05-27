import store, {Credentials} from "./store";
// @ts-ignore
import rally from 'rally';
import {Item} from "./models/Item";

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

    // TODO-mrc: is artifact the right choice here?
    const results = await fetchListOfItems('artifact', ['ObjectID', 'FormattedID'], query);
    let items = results.items;

    // NOTE: formattedIDS are in this format: 'US12345' or 'TR67890'
    // NOTE: the search by FormattedID only compare the #s and ignores the prefixed so we may get extra results
    // NOTE: we just need to find the one that matches our FormattedID and return it
    items = items.filter(item => (item.FormattedID === formattedID));
    const item = items.length > 0 ? new Item(items[0]) : null;

    // TODO-mrc:
    if (!item) {
        // TODO-mrc: can I throw an exeption for a 404?
        throw new Error("implement me");
    }

    // NOTE: do a second fetch to get back all the fields now that we know the item type
    return new Item(await fetchSingleItemByRef(item.getRef()));
}

export interface SearchResults {
    items: any[];
    hasMoreResults: boolean;
    totalRecords: number;
}

export async function fetchListOfItems(type: string, fields: string[], query = "", startIndex= 1,  pageSize=20) {
    console.assert(type != null);
    console.assert(fields != null);

    const resp = await getRallyAPI(store.getCredentials()).query({
        type: type,
        start: startIndex, // 1-based
        pageSize: pageSize,
        limit: pageSize,

        //    order: 'Rank', // TODO-mrc
        fetch: fields,
        query: query,
        scope: {
            //        project: '/project/2345' //specify to query a specific project
            //        up: false //true to include parent project results, false otherwise
            //down: true //true to include child project results, false otherwise
        },
    });

    validateRallyResponseOrThrow(resp);

    const results: SearchResults = {
        items: resp.Results,
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


const excludedFields = new Set<string>(['_rallyAPIMajor',
    '_rallyAPIMinor',
//    '_ref',
    '_refObjectUUID',
    '_objectVersion',
    '_refObjectName',
    'DirectChildrenCount',
    'Errors',
    'Warnings',
    'Results',
    'StartIndex',
    'PageSize']);

// Return list of fields to exclude from an item
export function filterOutFieldsExcludedFromDisplay(fields: string[]) {
    return fields.filter(f => !excludedFields.has(f));
}

export const ARTIFACT_SEARCH_FIELDS = ['FormattedID', 'Name', 'ObjectID', 'Owner', 'Project', 'Release', 'Iteration', 'CreationDate', 'Parent',
    'Description', 'Attachments', 'Notes', 'ScheduleState', '_ref'];
