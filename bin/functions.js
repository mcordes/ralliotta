const request = require('request');
const rallyURL = "https://rally1.rallydev.com/slm/webservice/v2.0/security/authorize";


exports.lookup = (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    console.log('Looking up user: ' + username);

    if (!username || !password) {
        res.send('Invalid username / password');
        res.status(401);
        return;
    }

    console.log(`Getting session id for user ${username}`);

    request({
        url: rallyURL,
        method: "GET",
//        jar: cookieJar,
        auth: {
            user: username,
            pass: password,
            sendImmediately: false,
        }    
    }, function (error, response, body){
        if (error) {
           res.status(500).send('Request failed: ' + error);
           return;
        }

        const headers = response.headers['set-cookie'];
        let zessionid;

        for (let x=0; x < headers.length; ++x) {
            const header = headers[x];
            const vals = header.split('=');
            const key = vals[0];
            const value = vals[1].split(';')[0];
            if (key === 'ZSESSIONID') {
                zsessionid = value;
                break;
            }
        }

        const result = JSON.parse(response.body);
        const securityToken = result.OperationResult.SecurityToken;

        const authData = {
             sessionId: zsessionid,
             securityToken: securityToken,
        }

        res.send(JSON.stringify(authData));
    });
}


exports.avatarImage = (req, res) => {
    const userObjectId = req.query.oid;
    const sessionId = req.query.sid;
    const imageSize = req.query.size || "43";
    
    const url = `https://rally1.rallydev.com/slm/profile/image/${userObjectId}/${imageSize}.sp`;

    request({
        url: url,
        method: "GET",
        auth: {
            'bearer': sessionId
        },
        encoding: null,
    }, function (error, response, body){
        if (error) {
            res.status(500).send('Request failed: ' + error);
            return;
        }

        const contentType = response.headers['content-type'];
        const cacheControl = response.headers['cache-control'];

        res.set("Content-Type", contentType.split(";")[0]);
        res.set("Cache-Control", cacheControl);
        res.send(response.body);
    });
}
