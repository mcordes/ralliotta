const express = require('express');
const request = require('request');
const cors = require('cors');

const app = express();
const port = 8088;
const rallyURL = "https://rally1.rallydev.com/slm/webservice/v2.0/security/authorize";

app.use(cors())


app.post('/lookup', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    console.log('Looking up user: ' + username);

    if (!username || !password) {
        // TODO-mrc: 400 error?
        res.send('Invalid username / password');
        return;
    }

    console.log(`Getting session id for user ${username}`);


    // TODO-mrc: I don't know how to use this. Would it be easier than below?
    const cookieJar = request.jar()

    request({
        url: rallyURL,
        method: "GET",
        jar: cookieJar,
        auth: {
            user: username,
            pass: password,
            sendImmediately: false,
        }    
    }, function (error, response, body){
        //console.log(response);

        if (error) {
           res.status(500).send('Request failed: ' + error);
           return;
        }

        // TODO-mrc: check status code
        // TODO-mrc check Errors element in response


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
});


app.get('/avatar/user/:userObjectId/session/:sessionId', (req, res) => {
    const userObjectId = req.params.userObjectId;
    const sessionId = req.params.sessionId;
    const imageSize = req.get.size || "43";
    
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

});


app.listen(port, () => console.log(`Proxy listening at http://localhost:${port}`))
