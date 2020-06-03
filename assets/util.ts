import {Vue} from "vue-property-decorator";


export function showSuccessToast(vue: Vue, msg: string) {
    // @ts-ignore
    vue.$vToastify.info(msg);
}

interface ErrorToastType {
    msg?: string;
    e?: Error;
}
export function showErrorToast(vue: Vue, options?: ErrorToastType) {
    const msg = options?.msg || "An error occurred";
    console.log(`Error: ${msg}: ${options?.e}`);

    // @ts-ignore
    vue.$vToastify.error(msg);
}
