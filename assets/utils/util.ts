import {Vue} from "vue-property-decorator";
import {DateTime} from "luxon";
import {config} from "../config";
import {SelectOption} from "../types/SelectOption";
import {Ref} from "../types/Ref";
// @ts-ignore
import rally from 'rally';

export const queryUtils = rally.util.query;
export const refUtils = rally.util.ref;

export function showSuccessToast(msg: string) {
    // @ts-ignore
    Vue.$toast.open({ type: "success", message: msg });
}

interface ErrorToastType {
    msg?: string;
    e?: Error;
}
export function showErrorToast(options?: ErrorToastType) {
    const msg = options?.msg || "An error occurred";
    console.log(`Error: ${msg}: ${options?.e}`);

    // @ts-ignore
    Vue.$toast.open({ type: "error", message: msg });

    if (options?.e) {
        throw options.e;
    }
}


export function toDateTime(value: string | Date | DateTime ): DateTime {
    if (value instanceof DateTime) {
        return value;
    }
    if (value instanceof Date) {
        return DateTime.fromJSDate(value);
    }
    return DateTime.fromISO("" + value);
}

export function toStringOrBlank(value: any) {
    if (!value) {
        return "";
    }
    return value.toString();
}

export function isRef(obj: any) {
    // Return true if obj looks (vaguely) like a Ref type
    return obj && obj._ref;
}

export function getItemDetailURLPath(formattedID: string) {
    let path = '/detail/' + formattedID;

    if (config.routerMode === "hash") {
        path = "#" + path;
    }
    return path;
}

export function getItemSearchURLPath(path: string, queryParams: any) {
    if (config.routerMode === "hash") {
        path = "#" + path;
    }

    const requestParams = new URLSearchParams(queryParams).toString();
    if (requestParams) {
        path += "?" + requestParams;
    }

    return path;
}

export async function getSelectOptionsFromRefs(items: Ref[]) {
    const results: SelectOption[] = items.map(r => { return {value: r._ref, label: r._refObjectName}; });
    return results;
}

export const RALLY_API_ROOT_URL = "https://rally1.rallydev.com/slm/webservice/v2.0";


export function getRecentlyUsedProject() {
    const val = localStorage.getItem("recent-project");
    if (!val) {
        return null;
    }
    const data = JSON.parse(val);
    return {ref: data.ref, label: data.label};
}

export function setRecentlyUsedProject(ref: string, label: string) {
    localStorage.setItem("recent-project", JSON.stringify({ref, label}));
}