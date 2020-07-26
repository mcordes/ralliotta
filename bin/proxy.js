const express = require('express');
const request = require('request');
const cors = require('cors');
const fns = require('./functions');

const app = express();
const port = 8088;

// TODO-mrc: override this somehow too
// TODO-mrc: I think it could also use an environment variable
const rallyURL = "https://rally1.rallydev.com/slm/webservice/v2.0/security/authorize";

app.use(express.json());
app.use(cors())


app.post('/lookup', (req, res) => {
    fns.lookup(req, res);
});

app.get('/avatar', (req, res) => {
    fns.avatarImage(req, res);
});


app.listen(port, () => console.log(`Proxy listening at http://localhost:${port}`))
