import {Vue} from "vue-property-decorator";
import {DateTime} from "luxon";
// @ts-ignore
import config from "../config.json";

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