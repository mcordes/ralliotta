import {Vue} from "vue-property-decorator";
import {DateTime} from "luxon";


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
