const express = require('express');
const cors = require('cors');
const sortBy = require("underscore").sortBy;
const transform = require("lodash").transform;
const app = express();
const port = 8089;

// TODO-mrc NEXT
// 4. what do we do about login? mock that too? assume alrady logged in somehow?
// 6. Give it a shot, what's working?
// 7. fix dates
// 8. make sure iteration start/end dates make sense



app.use(express.json());
app.use(cors())

let objectIdCounter = 100000000001;
const urlPrefix = "http://localhost:8089/slm/webservice/v2.0"
let formattedIdCounter = 10001;

function nextOid() {
    return objectIdCounter++;
}

function nextFormattedId(prefix) {
    return prefix + (formattedIdCounter++);
}

function getDataListForType(type) {
    const objectTypeMapping = {
        user: users,
        project: projects,
        flowstate: flowStates,
        release: releases,
        iteration: iterations,
        conversationpost: comments,
        "portfolioitem/epic": epics,
        artifact: artifacts,
        hierarchicalrequirement: artifacts,
        attachment: attachments,

        // TODO-mrc
        //defect: artifacts,
    };
    return objectTypeMapping[type];
}

app.get('/slm/webservice/v2.0/:type/:oid', (req, res) => {
    const type = req.params.type.toLowerCase();
    const list = getDataListForType(type);
    if (!list) {
        res.send(404);
        return;
    }

    return getObjectOr404(list, req, res, type.toUpperCase());
});

app.put('/slm/webservice/v2.0/:type/:oid', (req, res) => {
    const type = req.params.type.toLowerCase();
    const list = getDataListForType(type);
    const item = getSingleObjectByObjectId(list, req.params.oid);
    if (!item) {
        res.send(404);
        return;
    }

    // Incoming data is expected to be in this format - {hierarchicalrequirement: {Description: "test"}}

    debugger;
    const data = toLowerKeys(req.body)[req.params.type];

    // NOTE: just apply all past in fields.
    // XXX: no validation here
    Object.assign(item, data);

    // TODO-mrc: Now filter to just include the fields they asked for along with any field w/ name starting with an underscore

    res.send({ OperationResult: { Object: item, Errors: [], Warnings: []}});
});

app.post("/slm/webservice/v2.0/:type/create", (req, res) => {
    const type = req.params.type.toLowerCase();
    const list = getDataListForType(type);

    // TODO-mrc: where does project come from? maybe it's already on the incoming data
    const sampleData = getSampleDataByType(type, projects[0]);

    // Incoming data is expected to be in this format - {hierarchicalrequirement: {Description: "test", ...}}
    const incomingData = toLowerKeys(req.body)[req.params.type];

    const oid = nextOid();
    const item = { ...sampleData, ...incomingData, ObjectID: oid};

    // Set formatted id for defects or user stories
    if (["defect", "hierarchicalrequirement"].includes(type)) {
        item.FormattedID = nextFormattedId(type === "hierarchicalrequirement" ? "US" : "D");
    }

    list.push(item);

    // TODO-mrc: Now filter to just include the fields they asked for along with any field w/ name starting with an underscore

    res.send({ OperationResult: { Object: item, Errors: [], Warnings: []}});
});

app.get("/slm/webservice/v2.0/user", (req, res) => {
    if (!('query' in req.query)) {
        // NOTE: if the query attribute is not supplied this just returns a single record - the logged in user
        res.send({User: {...users[0], Errors: [], Warnings: []}});
        return;
    }

    // we're doing a regular search
    doSearch(req, res, 'user');
});

// search endpoint
app.get("/slm/webservice/v2.0/:type*", (req, res) => {
    const type = req.params.type.toLowerCase();
    doSearch(req, res, type);
});

function toLowerKeys(obj) {
    return transform(obj, (result, val, key) => {
        result[key.toLowerCase()] = val;
    });
}

function doSearch(req, res, type) {
    const fetch = req.query.fetch; //comma delimited list of fields to return. If a field is invalid Rally ignores it
    const query = req.query.query; // Rally's query language, you can do =, contains, !=, !contains
    const start = parseInt((req.query.start || "1"));  // 1 based
    const pageSize = parseInt((req.query.pagesize || "20"));
    const order = req.query.order || ""; // field name then optional ASC or DESC. Default to ascending?
    // TODO-mrc: only used by artifact search?
    const types = req.query.types;

    // TODO-mrc
    // NOTE: flowstate grouped by (artifact/groupby/flowstate) has a bunch of exta fields, maybe make that separate?

    console.log("Searching for " + type + " records");

    const list = getDataListForType(type);
    if (!list) {
        res.sendStatus(404);
        return;
    }

    let results = list.filter((v) => {
        if (!query) {
            // If there's no query filter then return all results
            return true;
        }

        debugger;

        // Otherwise convert the query string (something along the lines of [((foo = bar) or (bar = baz) and (baz !contains foo))]
        // to a boolean string we can evaluate [something like ((1) || (0) && (1))]
        const queryStr = `${query}`.replace(/\s+/g, " ");
        const queryChunks = queryStr.split("(");

        queryChunks.forEach(chunk => {

            debugger;

            let result = chunk.match(/([^)\s]+) ([^)\s]+) ([^)\s])/);
            if (result) {

                // TODO-mrc: implement me
                const includeItem = true;

                // replace each equation with boolean
                chunk.replace(/([^)\s]+) ([^)\s]+) ([^)\s])/, `${includeItem}`);
            }

            // TODO-mrc: prevent false positives
            result = chunk.match(/(and|or)/);
            if (result) {
                // TODO-mrc; again beware of false positives. This will match in field names
                chunk.replace(/and/, "&&");
                chunk.replace(/or/, "||");
            }
        });

        // Now the query chunks should just contain boolean values and operators so if we
        // evaluate it, we'll get the end result. Should we include this item in the results list or not?
        const queryStringBool = queryChunks.join("(");
        console.log("* query: " + queryStringBool);

        // TODO-mrc: implement me
        return true; // eval(queryStringBool);
    })

    // TODO-mrc: value for DESCending?
    // TODO-mrc: order will be fieldname {ASC,DSC}
    const [field, direction] = `${order}`.split(" ");

    // TODO-mrc: there's a similar fn that lets you set the order direction. Fix me.
    results = sortBy(results, field);

    if (direction === 'DESC') {
        results = results.reverse();
    }

    // TODO-mrc: Now filter to just include the fields they asked for along with any field w/ name starting with an underscore

    const resultsPaged = results.slice(start-1, pageSize);

    res.send({QueryResult: {"Errors": [], "Warnings": [], "TotalResultCount": resultsPaged.length, "Results": resultsPaged,
            "StartIndex": start, "PageSize": pageSize, }});
}

app.get("/", (req, res) => {
    res.send("<h1>Mock Rally API!</h1><h2>What up?</h2><p>This application provides a mock version of Rally's API for testing purposes");
});


function getObjectOr404(list, req, res, rootElement) {
    const oid = req.params.oid;
    console.log(`Looking up ${rootElement} by id ${oid}`)

    const obj = getSingleObjectByObjectId(list, oid);

    if (!obj) {
        res.status(404);
    }

    const result = {};
    result[rootElement] = {...obj, Errors: [], Warnings: []};

    res.send(result);
}

function getSingleObjectByObjectId(list, oid) {
    return list.find((value) => {
        debugger;
        console.log("XXXXX = oid="+oid + ", value=" + JSON.stringify(value));
        const match = value.ObjectID.toString() === oid;
        console.log(`Comparing ${value.ObjectID} vs ${oid}, result: ${match}`);
        return match;
    });
}


app.listen(port, () => console.log(`MockRally listening at http://localhost:${port}`))


var projects = [
    getSampleProject("Project1"),
    getSampleProject("Project2")
];

var users = [
    getSampleUser("User1", projects[0]),
    getSampleUser("User2", projects[0]),
    getSampleUser("User3", projects[1]),
    getSampleUser("User4", projects[1]),
];

var releases = [
    getSampleRelease("Release One"),
    getSampleRelease("Release Two"),
];
var flowStates = [
    getSampleFlowState("Ready", projects[0]),
    getSampleFlowState("In Progress", projects[0]),
    getSampleFlowState("Completed", projects[0]),
    getSampleFlowState("Ready2", projects[1]),
    getSampleFlowState("In Progres2", projects[1]),
    getSampleFlowState("Completed2", projects[1]),
];
var iterations = [
    getSampleIteration("Iteration One", projects[0]),
    getSampleIteration("Iteration Two", projects[0]),
    getSampleIteration("Iteration Three", projects[1]),
];
var epics = [
    // TODO-mrc; don't we need to set the project here too?
    getSampleEpic("Epic One"),
    getSampleEpic("Epic Two"),
]

// TODO-mrc: user stories vs defects here?
var artifacts = [
    getSampleArtifact("User story 1", projects[0], flowStates[0]),
    getSampleArtifact("User story 2", projects[0], flowStates[1]),
    getSampleArtifact("User story 3", projects[1], flowStates[3]),
];

var comments = [
    getSampleComment(artifacts[0], "testing 1 2 3"),
    getSampleComment(artifacts[0], "testing 4 5 6"),
    getSampleComment(artifacts[1], "This is a comment"),
]

// TODO-mrc
var attachments = [];

function getSampleDataByType(type, project) {
    switch(type) {
        case "project":
            return getSampleProject("");
        case "user":
            return getSampleUser("", project);
        case "release":
            return getSampleRelease("");
        case "iteration":
            return getSampleIteration("", project);
        case "hierarchicalrequirement":
            // TODO-mrc: should get flowstate for project, right?
            return getSampleArtifact("", project, flowStates[0]);
        case "defect":
            throw new Error("Implement me");
        default:
            throw new Error("Unknown type: " + type);
    }
}

function getSampleProject(name) {
    const oid = nextOid();

    return {
        "_ref": `${urlPrefix}/project/${oid}`,
        "_refObjectUUID": "XXX",
        "_objectVersion": "1", "_refObjectName": name, "CreationDate": "2020-01-08T18:26:56.266Z", "ObjectID": oid,
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

function getSampleUser(username, project) {
    const oid = nextOid();
    return {
        "_ref": `${urlPrefix}/user/${oid}`,
        "_refObjectUUID": "XXX", "_objectVersion": "1", "_refObjectName": username, "CreationDate": "2020-02-01T21:22:17.084Z",
        "ObjectID": oid, "ObjectUUID": "XXX", "VersionId": "1",
        "CostCenter": "None", "DateFormat": null, "DateTimeFormat": null, "DefaultDetailPageToViewingMode": false,
        "DefaultProject": getRef(project),
        "Deleted": false, "Department": "None", "Disabled": false, "DisplayName": username, "EmailAddress": "foo@bar.com",
        "EmailNotificationEnabled": false, "FirstName": username, "InvestmentAdmin": false, "LandingPage": "/dashboard",
        "Language": "en-US", "LastActiveDate": "2020-07-16T06:00:00.000Z", "LastLoginDate": "2020-07-16T00:17:32.768Z",
        "LastName": "Last name", "LastPasswordUpdateDate": "2020-05-04T03:45:15.894Z",
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

function getSampleArtifact(name, project, flowState) {
    const oid = nextOid();
    const formattedId = nextFormattedId("US");

    return {
        "_ref": `${urlPrefix}/hierarchicalrequirement/${oid}`,
        "_refObjectUUID": "XXX",
        "_objectVersion": "1",
        "_refObjectName": "User story 1",
        "CreationDate": "2020-04-23T17:49:24.118Z",
        "ObjectID": oid,
        "ObjectUUID": "XXX",
        "VersionId": "1",
        "CreatedBy": getRef(users[0]),
        "Description": "XXX",
        "DisplayColor": "#21a2e0",
        "Expedite": false,
        "FormattedID": formattedId,
        "LastUpdateDate": "2020-07-16T03:41:23.759Z",
        "LatestDiscussionAgeInMinutes": 143,
        "Name": name,
        "Notes": "XXX",
        "Owner": getRef(users[0]),
        "Project": getRef(project),
        "Ready": false,
        "FlowState": getRef(flowState),
        "FlowStateChangedDate": "2020-07-16T03:41:23.735Z",
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
        "InProgressDate": "2020-07-16T03:41:23.736Z",
        "Iteration": iterations[0],
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

function getSampleRelease(name) {
    const oid = nextOid();
    return {
        "_ref": `${urlPrefix}/release/${oid}`, "_refObjectUUID": "XXX",
        "_objectVersion": "1", "_refObjectName": name,
        "Name": name, "_type": "Release"
    };
}

function getSampleIteration(name, project) {
    const oid = nextOid();
    return {
        "_ref": `${urlPrefix}/iteration/${oid}`, "_refObjectUUID": "XXX", "_objectVersion": "3", "_refObjectName": name,
        "EndDate": "2020-07-22T06:59:59.000Z", "Name": name,
        "Project": getRef(project),
        "StartDate": "2020-07-08T07:00:00.000Z", "_type": "Iteration"
    }
}

function getSampleComment(artifact, text) {
    const oid = nextOid();
    return {
        "_ref": `${urlPrefix}/conversationpost/${oid}`, "_refObjectUUID": "XXX"
        , "_objectVersion": "2", "CreationDate": "2020-07-16T01:41:32.669Z",
        "Artifact": getRef(artifact, ["Name", "FormattedID"]),
        "PostNumber": 0,
        "ObjectID": oid,
        "Text": text,
        "User": getRef(users[0]),
        "_type": "ConversationPost"
    };
}

function getSampleEpic(name) {
    const oid = nextOid();

    // TODO-mrc: formatted id? add that too!

    return {
        "_ref": `${urlPrefix}/portfolioitem/epic/${oid}`, "_refObjectUUID": "XXX", "_refObjectName": name, "_type": "PortfolioItem/EPIC"
    };
}

function getSampleFlowState(name, project) {
    const oid = nextOid();

    return {"_ref": `${urlPrefix}/flowstate/${oid}`, "_refObjectUUID": "XXX", "_objectVersion": "1",
        "_refObjectName": name, "CreationDate": "2020-01-08T18:26:01.082Z", "Name": name,
        "Project": project, "_type": "FlowState"};
}


function getRef(obj, additionalFields=[]) {
    let result = {
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
