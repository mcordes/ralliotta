import {User} from "../types/User";
import {Ref} from "../types/Ref";
import {AddUpdateFieldData, ListOptions, Service} from "./service";
import {MockRallyStore} from "./mockrally";
import {refUtils} from "../utils/util";

const dataStore = MockRallyStore;

export class MockService extends Service {
    async fetchCurrentUser() {
        const user = dataStore.search("user").items[0];
        return user;
    }

    // @ts-ignore
    async login(username: string, password: string) {
        return {
            sessionId: "1",
            securityToken: "2"
        };
    }

    async fetchSingleItemByRef(ref: string | Ref) {
        const type = refUtils.getType(ref);
        const oid = refUtils.getId(ref);
        return dataStore.getSingleItem(type, oid);
    }

    async updateItem(ref: string, data: AddUpdateFieldData) {
        const type = refUtils.getType(ref);
        const oid = refUtils.getId(ref);
        return dataStore.updateItem(type, oid, data);
    }

    async createItem(type: string, data: AddUpdateFieldData) {
        return dataStore.createItem(type, data);
    }

    async fetchListOfItems(type: string, fields: string[], options: ListOptions) {
        // function search(type: string, fetch = "", start: 1, pageSize: 20, order = "", query = "") {
        const fetch = fields.join(",");
        const query = options.query ? options.query.toQueryString() : "";
        const project = dataStore.search("project").items[0];

        if (type === "artifact/groupby/flowstate") {
            // HACK - integrate this better
            const itemQuery = options.kwargs ? options.kwargs['itemquery'] : "";
            return dataStore.searchArtifactGroupByFlowState(project, itemQuery);
        }
        else {
            return dataStore.search(type, fetch, options.startIndex, options.pageSize, options.order, query);
        }
    }

    // @ts-ignore
    getAvatarImageURL(user: User | Ref, size: number): string {
        return "";
    }
}
