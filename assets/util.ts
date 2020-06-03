import {Vue} from "vue-property-decorator";


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
}
