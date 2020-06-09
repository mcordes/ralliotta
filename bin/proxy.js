const express = require('express');
const request = require('request');
const cors = require('cors');
const fns = require('./functions');

const app = express();
const port = 8088;
const rallyURL = "https://rally1.rallydev.com/slm/webservice/v2.0/security/authorize";

app.use(cors())


app.post('/lookup', (req, res) => {
    functions.lookup(req, res);
});

app.get('/avatar/user/:userObjectId/session/:sessionId', (req, res) => {
    functions.avatarImage(req, res);
});


app.listen(port, () => console.log(`Proxy listening at http://localhost:${port}`))
