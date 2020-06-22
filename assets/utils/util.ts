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
    console.trace();

    // @ts-ignore
    Vue.$toast.open({ type: "error", message: msg });
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
