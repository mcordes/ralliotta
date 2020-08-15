import {groupBy, isEqual} from "underscore";
import {transform, orderBy} from "lodash";
import {refUtils} from "../utils/util";
import { v4 as uuidv4 } from 'uuid';
import {DateTime, Duration} from "luxon";

const urlPrefix = "http://localhost:8089/slm/webservice/v2.0"

let _store: any;
function getStore() {
    if (!_store) {
        // Initialize sample data stored in local storage
        _store = JSON.parse(localStorage.getItem("sampleData") || "null");
        if (!_store) {
            _store = initStore();
            localStorage.setItem("sampleData", JSON.stringify(_store));
        }
    }
    return _store;
}

function getDataListForType(type: string) {
    const store = getStore();
    const objectTypeMapping: any = {
        user: store.users,
        project: store.projects,
        flowstate: store.flowStates,
        release: store.releases,
        iteration: store.iterations,
        conversationpost: store.comments,
        "portfolioitem/epic": store.epics,
        artifact: store.artifacts,
        hierarchicalrequirement: store.artifacts,
        attachment: store.attachments,

        // TODO: support defects too?
        defect: [],
    };
    return objectTypeMapping[type];
}

function toLowerKeys(obj: any) {
    return transform(obj, (result: any, val: string, key: string) => {
        result[key.toLowerCase()] = val;
    });
}

function shouldIncludeItem(chunk: string, item: any) {
    const result = chunk.match(/([^)\s]+) ([^)\s]+) ([^)\s]+)/);
    if (result) {
        const field: string = result[1];
        const operator: string = result[2];
        let value: string = result[3];

        // Does the item have this field?
        if (!(field in item)) {
            console.log(`Excluding item ${item._ref} - doesn't have field: ${field}`);
            return false;
        }

        let itemValue = `${item[field]}`;

        // if it's a ref field we're comparing an object {_ref:""} to a string "/foo/id"
        // update the itemValue to be the string as well
        if (item[field] && item[field]._ref) {
            itemValue = item[field]._ref;

            // Incoming ref values could be the long version (starting with http) or relative (e.g. "/foo/id")
            // prepend the url prefix so we can compare these with stored ref values which are always the full version
            if (value && !value.startsWith("http://")) {
                value = urlPrefix + value;
            }
        }

        let includeItem = false;
        switch (operator) {
            case "=":
                includeItem = isEqual(itemValue, value);
                break;
            case "!=":
                includeItem = itemValue != value;
                break;
            case "contains":
                includeItem = itemValue.indexOf(value) != -1;
                break;
            case "!contains":
                includeItem = itemValue.indexOf(value) == -1;
                break;
            case "<=":
                includeItem = itemValue <= value;
                break;
            case "<":
                includeItem = itemValue < value;
                break;
            case ">=":
                includeItem = itemValue >= value;
                break;
            case ">":
                includeItem = itemValue > value;
                break;
            default:
                throw new Error(`Unexpected query operator: ${operator}`);
        }
        console.log(`Filtering on field ${field}: '${itemValue}' ${operator} '${value}' == ${includeItem}`);
        return includeItem;
    }
}

// fetch - comma delimited list of fields to return. If a field is invalid Rally ignores it
// query - Rally's query language, you can do =, contains, !=, !contains, <, <=, >, >=
function search(type: string, fetch = "", start?: number, pageSize?: number, order = "", query = "") {
    console.log("Searching for " + type + " records");
    if (!start) {
        start = 1;
    }

    if (!pageSize) {
        pageSize = 20;
    }

    type = type.toLowerCase();
    const list = getDataListForType(type);
    if (!list) {
        throw new Error("Unexpected type: " + type);
    }

    let results = list.filter((item: any) => {
        if (!query) {
            // If there's no query filter then return all results
            return true;
        }

        // Otherwise convert the query string (something along the lines of [((foo = bar) or (bar = baz) and (baz !contains foo))]
        // to a boolean string we can evaluate [something like ((1) || (0) && (1))]
        const queryStr = `${query}`.replace(/\s+/g, " ");
        const queryChunks = queryStr.split("(");
        const updatedChunks: any[] = [];
        console.log(`Query: ${queryStr}`);

        queryChunks.forEach(chunk => {
            const includeItem = shouldIncludeItem(chunk, item);

            // replace each equation with boolean
            chunk = chunk.replace(/([^)\s]+) ([^)\s]+) ([^)\s]+)/, `${includeItem}`);
            chunk = chunk.replace(/and/i, "&&");
            chunk = chunk.replace(/or/i, "||");

            updatedChunks.push(chunk);
        });

        // Now the query chunks should just contain boolean values and operators so if we
        // evaluate it, we'll get the end result. Should we include this item in the results list or not?
        const queryStringBool = updatedChunks.join("(");
        console.log("* query: " + queryStringBool);

        // NOTE: this isn't safe, but as it's just used for the sample data maybe we're OK.
        // TODO-mrc: we could probably double check the string above doesn't have anything other than (),boolean,&&,||
        return eval(queryStringBool);
    })

    const [field, direction] = `${order}`.split(" ");
    results = orderBy(results, [field], [direction === 'DESC' ? 'desc' : 'asc']);

    return {items: results.slice(start-1, pageSize)};
}


function searchArtifactGroupByFlowState(project: any, itemQuery: string) {
    // NOTE: itemquery is the query used for actual items when searching and grouping
    const selectedArtifacts = search('artifact', "", 1, 20, "", itemQuery).items;

    // TODO-mrc: handle these too?
    // itemfetch= - comma separated of fields to return on the item objects (we're returning all fields now)
    // itemorder
    // itemtypes=defect%2ChierarchicalRequirement

    const store = getStore();
    const projectRef = project._ref;
    const projectFlowStates = store.flowStates.filter((f: any) => {
        return f.Project._ref === projectRef;
    });

    const results: any = [];

    const artifactsByFlowState = groupBy(selectedArtifacts, (item: any) => {
        return item.FlowState._ref;
    });

    projectFlowStates.forEach((flowState: any) => {
        const artifactsInState = artifactsByFlowState[flowState._ref] || [];

        const group = {
            Group: flowState,
            TotalResultCount: artifactsInState.length,
            StartIndex: 1, PageSize: 9999,
            Items: artifactsInState
        };
        results.push(group);
    });

    return {items: results};
}

function getSingleObjectByObjectId(type: string, oid: string) {
    type = type.toLowerCase();
    const list = getDataListForType(type);
    if (!list) {
        throw new Error("unexpected type: " + type);
    }

    console.log(`Looking up ${type} by id ${oid}`)

    const result = list.find((value: any) => {
        const match = value.ObjectID.toString() === oid;
        console.log(`Comparing ${value.ObjectID} vs ${oid}, result: ${match}`);
        return match;
    });

    if (!result) {
        throw new Error(`Couldn't find ${type} with id ${oid}`);
    }

    return result;
}



function initStore() {
    const projects = [
        getSampleProject("Project1"),
        getSampleProject("Project2")
    ];
    const users = [
        getSampleUser("User1", projects[0]),
        getSampleUser("User2", projects[0]),
        getSampleUser("User3", projects[1]),
        getSampleUser("User4", projects[1]),
    ];
    const releases = [
        getSampleRelease("Release One", projects[0]),
        getSampleRelease("Release Two", projects[0]),
    ];
    const flowStates = [
        getSampleFlowState("Ready", projects[0]),
        getSampleFlowState("In Progress", projects[0]),
        getSampleFlowState("Completed", projects[0]),
        getSampleFlowState("Ready2", projects[1]),
        getSampleFlowState("In Progres2", projects[1]),
        getSampleFlowState("Completed2", projects[1]),
    ];

    const now = DateTime.local();
    const twoWeeksFromToday = DateTime.local().plus(Duration.fromObject({days: 14}));
    const twoWeeksAgo = DateTime.local().minus(Duration.fromObject({days: 14}));

    const iterations = [
        getSampleIteration("Iteration One", projects[0], twoWeeksAgo, now),
        getSampleIteration("Iteration Two", projects[0], now, twoWeeksFromToday),
        getSampleIteration("Iteration Three", projects[1], now, twoWeeksFromToday),
    ];
    const epics = [
        // TODO-mrc; don't we need to set the project here too?
        getSampleEpic("Epic One"),
        getSampleEpic("Epic Two"),
    ];

    const artifacts = [
        getSampleArtifact(users, releases, epics, "User story 1", projects[0], flowStates[0], iterations[1]),
        getSampleArtifact(users, releases, epics,"User story 2", projects[0], flowStates[1], iterations[1]),
        getSampleArtifact(users, releases, epics, "User story 3", projects[0], flowStates[2], iterations[0]),
        getSampleArtifact(users, releases, epics, "User story 4", projects[0], flowStates[0], null),
        getSampleArtifact(users, releases, epics, "User story 5", projects[0], flowStates[0], null),
        getSampleArtifact(users, releases, epics, "User story 6", projects[1], flowStates[0], null),
        getSampleArtifact(users, releases, epics, "User story 7", projects[1], flowStates[0], null),
    ];

    const comments = [
        getSampleComment(users, artifacts[0], "testing 1 2 3"),
        getSampleComment(users, artifacts[0], "testing 4 5 6"),
        getSampleComment(users, artifacts[1], "This is a comment"),
    ];

    // TODO-mrc
    const attachments: any = [];

    return {
        projects,
        users,
        releases,
        flowStates,
        iterations,
        epics,
        artifacts,
        comments,
        attachments,
    }
}

function getSampleDataByType(type: string, project: any) {
    const store = getStore();
    switch(type) {
        case "project":
            return getSampleProject("");
        case "user":
            return getSampleUser("", project);
        case "release":
            return getSampleRelease("", project);
        case "iteration":
            return getSampleIteration("", project, DateTime.local(), DateTime.local().plus(Duration.fromObject({days: 14})));
        case "hierarchicalrequirement":
            // TODO-mrc: should get flowstate for project, right?
            return getSampleArtifact(store.users, store.releases, store.epics, "", project, store.flowStates[0], store.iterations[0]);
        case "conversationpost":
            return getSampleComment(store.users, null, "");
        case "defect":
            throw new Error("Implement me");
        default:
            throw new Error("Unknown type: " + type);
    }
}

function getSampleProject(name: string) {
    const oid = uuidv4();
    const now = DateTime.local();

    return {
        "_ref": `${urlPrefix}/project/${oid}`,
        "_refObjectUUID": "XXX",
        "_objectVersion": "1", "_refObjectName": name, "CreationDate": now.toISO(), "ObjectID": oid,
        "ObjectUUID": "XXX", "VersionId": "1",
        "Description": "",
        "Name": name, "Notes": "",
        "SchemaVersion": "64cca7f06e3c53ed1903670ad0846b97", "State": "Open",

        // NOTE: not implemented
        "Subscription": null,
        "BuildDefinitions": null,
        "Children": null,
        "Owner": null,
        "Parent": null,
        "Releases": null,
        "RevisionHistory": null,
        "TeamMembers": null,
        "Workspace": null,
        "Iterations": null,
    };
}

function getSampleUser(username: string, project: any) {
    const oid = uuidv4();
    const now = DateTime.local();

    return {
        "_ref": `${urlPrefix}/user/${oid}`,
        "_refObjectUUID": "XXX", "_objectVersion": "1", "_refObjectName": username, "CreationDate": now.toISO(),
        "ObjectID": oid, "ObjectUUID": "XXX", "VersionId": "1",
        "CostCenter": "None", "DateFormat": null, "DateTimeFormat": null, "DefaultDetailPageToViewingMode": false,
        "DefaultProject": getRef(project),
        "Deleted": false, "Department": "None", "Disabled": false, "DisplayName": username, "EmailAddress": "foo@bar.com",
        "EmailNotificationEnabled": false, "FirstName": username, "InvestmentAdmin": false, "LandingPage": "/dashboard",
        "Language": "en-US", "LastActiveDate": now.toISO(), "LastLoginDate": now.toISO(),
        "LastName": "Last name", "LastPasswordUpdateDate": now.toISO(),
        "LastSystemTimeZoneName": "America/New_York", "Locale": "en-US", "MiddleName": null, "NetworkID": null,
        "OfficeLocation": "None", "OnpremLdapUsername": null, "PasswordExpires": 0, "Phone": null, "Planner": false,

        // TODO-mrc: generic image?
        "ProfileImage": null, // {"_ref": "https://rally1.rallydev.com/slm/webservice/v2.0/profileimage/387120895968", "_refObjectUUID": "2cb00d75-74e4-40ef-a375-9f7b77f46349", "_type": "ProfileImage"},

        "ProjectScopeDown": false,
        "ProjectScopeUp": false,
        "Role": "Engineer", "sessionTimeout": 1209600, "SessionTimeoutWarning": true, "ShortDisplayName": null, "SubscriptionAdmin": false, "SubscriptionID": 1, "SubscriptionPermission": "Workspace User",
        "UserName": username,
        "WorkspacePermission": "Workspace User",
        "AccountLockedUntil": null,

        // NOTE: not implemented
        "Subscription": null,
        "ArtifactsCreated": null,
        "ArtifactsOwned": null,
        "RevisionHistory": null,
        "UserPermissions": null,
        "UserProfile": null,
        "TeamMemberships": null,
    }
}

function nextFormattedId(prefix: string) {
    const random5Digit = Math.floor(Math.random()*90000) + 10000;
    return prefix + random5Digit;
}

function getSampleArtifact(users: any, releases: any, epics: any, name: string, project: any, flowState: any, iteration: any) {
    const oid = uuidv4();
    const formattedId = nextFormattedId("US");
    const now = DateTime.local();

    return {
        "_ref": `${urlPrefix}/hierarchicalrequirement/${oid}`,
        "_refObjectUUID": "XXX",
        "_objectVersion": "1",
        "_refObjectName": name,
        "CreationDate": now.toISO(),
        "ObjectID": oid,
        "ObjectUUID": "XXX",
        "VersionId": "1",
        "CreatedBy": getRef(users[0]),
        "Description": "XXX",
        "DisplayColor": "#21a2e0",
        "Expedite": false,
        "FormattedID": formattedId,
        "LastUpdateDate": now.toISO(),
        "LatestDiscussionAgeInMinutes": 143,
        "Name": name,
        "Notes": "XXX",
        "Owner": getRef(users[0]),
        "Project": getRef(project),
        "Ready": false,
        "FlowState": getRef(flowState),
        "FlowStateChangedDate": now.toISO(),
        "LastBuild": null,
        "LastRun": null,
        "PassingTestCaseCount": 0,
        "ScheduleState": "In-Progress",
        "ScheduleStatePrefix": "P",
        "TestCaseCount": 0,
        "Package": null,
        "AcceptedDate": null,
        "Blocked": false,
        "BlockedReason": null,
        "Blocker": null,
        "DefectStatus": "NONE",
        "DirectChildrenCount": 0,
        "DragAndDropRank": "",
        "HasParent": false,
        "InProgressDate": now.toISO(),
        "Iteration": iteration,
        "Parent": null,
        "PlanEstimate": 3.0,
        "Recycled": false,
        "Release": getRef(releases[0]),
        "TaskActualTotal": 0.0,
        "TaskEstimateTotal": 0.0,
        "TaskRemainingTotal": 0.0,
        "TaskStatus": "NONE",
        "TestCaseStatus": "NONE",
        "EPIC": getRef(epics[0]),
        "PortfolioItem": getRef(epics[0]), // NOTE: not a typo, this seems to be the same thing as EPIC

        // NOTE: not implemented
        "Subscription": null,
        "Workspace": null,
        "Changesets": null,
        "Connections": null,
        "Discussion": null,
        "Milestones": null,
        "Tags": null,
        "Attachments": null,
        "Children": null,
        "Defects": null,
        "Predecessors": null,
        "TestCases": null,
        "Risks": null,
        "RevisionHistory": null,
        "Tasks": null,
    }
}

function getSampleRelease(name: string, project: any) {
    const oid = uuidv4();
    return {
        "_ref": `${urlPrefix}/release/${oid}`, "_refObjectUUID": "XXX",
        "_objectVersion": "1", "_refObjectName": name,
        "Name": name, "_type": "Release", "Project": getRef(project),
    };
}

function getSampleIteration(name: string, project: any, startDate: DateTime, endDate: DateTime) {
    const oid = uuidv4();
    const now = DateTime.local();

    return {
        "_ref": `${urlPrefix}/iteration/${oid}`, "_refObjectUUID": "XXX", "_objectVersion": "3", "_refObjectName": name,
        "ObjectID": oid,
        "EndDate": endDate.toISO(), "Name": name,
        "Project": getRef(project),
        "StartDate": startDate.toISO(), "_type": "Iteration"
    }
}

function getSampleComment(users: any, artifact: any, text: string) {
    const oid = uuidv4();
    const now = DateTime.local();

    return {
        "_ref": `${urlPrefix}/conversationpost/${oid}`, "_refObjectUUID": "XXX"
        , "_objectVersion": "2", "CreationDate": now.toISO(),
        "Artifact": getRef(artifact, ["Name", "FormattedID"]),
        "PostNumber": 0,
        "ObjectID": oid,
        "Text": text,
        "User": getRef(users[0]),
        "_type": "ConversationPost"
    };
}

function getSampleEpic(name: string) {
    const oid = uuidv4();

    // TODO-mrc: formatted id? add that too!

    return {
        "_ref": `${urlPrefix}/portfolioitem/epic/${oid}`, "_refObjectUUID": "XXX", "_refObjectName": name, "_type": "PortfolioItem/EPIC"
    };
}

function getSampleFlowState(name: string, project: any) {
    const oid = uuidv4();
    const now = DateTime.local();

    return {"_ref": `${urlPrefix}/flowstate/${oid}`, "_refObjectUUID": "XXX", "_objectVersion": "1",
        "_refObjectName": name, "CreationDate": now.toISO(), "Name": name,
        "Project": project, "_type": "FlowState"};
}

export function getRef(obj: any, additionalFields: any[] = []) {
    if (!obj) {
        return null;
    }
    const result: any = {
        _ref: obj._ref,
        _refObjectUUID: obj._refObjectUUID,
        _refObjectName: obj._refObjectName,
        _type: obj._type,
    };

    additionalFields.forEach((f) => {
        result[f] = obj[f];
    });

    return result;
}

function getSingleItem(type: string, oid: string) {
    return getSingleObjectByObjectId(type, oid);
}

function updateItem(type: string, oid: string, data: any) {
    const item = getSingleObjectByObjectId(type, oid);
    const replacedData = replaceWithRefs(data);

    // NOTE: just apply all past in fields.
    // XXX: no validation here (shouldn't overwrite type, objectid, _ref, etc)
    Object.assign(item, replacedData);
    const list = getDataListForType(type);
    const index = list.findIndex((i: any) => {
        return item.ObjectID == i.ObjectID
    });
    list[index] = item;

    // TODO-mrc: will this work?
    const store = getStore();
    localStorage.setItem("sampleData", JSON.stringify(store));


    // TODO-mrc: Now filter to just include the fields they asked for along with any field w/ name starting with an underscore

    return item;
}

function createItem(type: string, data: any) {
    type = type.toLowerCase();
    const list = getDataListForType(type);
    const store = getStore();

    // TODO-mrc: where does project come from? maybe it's already on the incoming data
    const sampleData = getSampleDataByType(type, store.projects[0]);

    // TODO-mrc: ignore
    const replacedData = replaceWithRefs(data);

    const item = { ...sampleData, ...replacedData};

    // Set formatted id for defects or user stories
    if (["defect", "hierarchicalrequirement"].includes(type)) {
        item.FormattedID = nextFormattedId(type === "hierarchicalrequirement" ? "US" : "D");
    }

    console.log("Adding newly created item to list: " + type);
    list.push(item);

    // TODO-mrc: will this work?
    localStorage.setItem("sampleData", JSON.stringify(store));

    // TODO-mrc: Now filter to just include the fields they asked for along with any field w/ name starting with an underscore
    return item;
}

function replaceWithRefs(data: any) {
    for (const key of Object.keys(data)) {
        // replace incoming strings that look like Ref string with the real ref object
        // throws an exception if we can't find the referenced object
        const value = data[key];
        if (value && value.startsWith(urlPrefix)) {
            const type = refUtils.getType(value).toLowerCase();
            const oid = refUtils.getId(value);
            const obj = getSingleObjectByObjectId(type, oid);
            data[key] = getRef(obj);
        }
    }
    return data;
}

// TODO-mrc: maybe store this in the session?
// TODO-mrc: add an init method to setup the data? (this is nice b/c they'll be able to reload the page).
// TODO-mrc: should mock use a different session key for the user token and stuff?

export const MockRallyStore = {
    getSingleItem,
    updateItem,
    createItem,
    search,
    searchArtifactGroupByFlowState,
}
