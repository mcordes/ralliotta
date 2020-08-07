import {config} from "../config";
import {RallyService} from "./rally-service";
import {MockService} from "./mock-service";
import {Service} from "./service";

let service: Service | null = null;
export function getService(): Service {
    if (service == null) {
        service = config.useMockRallyAPI ? new MockService() : new RallyService();
    }
    return service;
}