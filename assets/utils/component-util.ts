import {AddUpdateFieldData, updateItem} from "./rally-util";
import {showErrorToast, showSuccessToast} from "./util";

export async function updateSingleItemAndShowToast(fieldName: string, value: string, itemRef: string) {
    const data: AddUpdateFieldData = {};
    data[fieldName] = value;

    try {
        const result = await updateItem(itemRef, data)
        value = result[fieldName];
        showSuccessToast("Saved.");
    }
    catch (e) {
        showErrorToast({e});
    }
    return value;
}
