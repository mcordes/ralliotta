import {showErrorToast, showSuccessToast} from "./util";
import {AddUpdateFieldData} from "../services/service";
import {getService} from "../services/init";

export async function updateSingleItemAndShowToast(fieldName: string, value: string, itemRef: string) {
    const data: AddUpdateFieldData = {};
    data[fieldName] = value;


    try {
        const result = await getService().updateItem(itemRef, data)
        value = result[fieldName];
        showSuccessToast("Saved.");
    }
    catch (e) {
        showErrorToast({e});
    }
    return value;
}
