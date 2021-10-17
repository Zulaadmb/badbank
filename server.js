var express =   require('express');
var app     =   express();
var cors    =   require('cors');
var dal     =   require('./dal.js');
const session = require('express-session')
const path = require('path');
const PORT = process.env.port || 8080;

var bodyParser = require('body-parser')

//used to serve static files from public directory
app.use(express.static('client/build'));
app.use(cors());
app.use(session({secret:'9a22dad3bd3f6a74c258586b1538480db3978bbb'
,name:'9a22dad3bd3f6a74c258586b1538480db3978bbb'
,saveUninitialized:false}))

//create user account
app.get('/account/create/:name/:email/:password', function(req, res) {
    console.log(req);
    // check if user exists already 
    dal.findOne(req.params.email)
    .then((docs) => {
        if (docs.length == 0) {
            dal.create(req.params.user, req.params.email, req.params.password).
            then((user) => {
                console.log(user);
                res.send(user);
            });
        }
        else {
            res.send({code: "error"});
        }
    })
});


app.get('/account/login/:email/:password', function (req, res) {
    console.log(req.params.email, req.params.password);
    dal.findOne(req.params.email)
    .then((docs) => {
        if (docs.length == 0) {
            res.send({code: "error"})
        }
        if (docs[0].password == req.params.password) {
            req.session.loggedIn = req.params.email;
            res.send({code: "success"});
        }
        else {
            res.send({code: "failed"});
        }
    })
});

app.get('/account/logout', function (req, res) {
    console.log(req.session);
    req.session.loggedIn = undefined;
    res.send(req.session.loggedIn);
});

app.get('/account/info', function(req, res) {
    console.log("Getting info request ",req.session);
    res.send({user: req.session.loggedIn})
});

app.get('/account/balance/:email', function (req, res) {
    dal.findOne(req.params.email)
    .then((docs) => {
        res.send({ balance: docs[0].balance});
    })
});

app.get('/account/deposit/:email/:value', function (req, res) {
    console.log(req.session);
    dal.updateOne(req.params.email, req.params.value)
    dal.createHistory(new Date(), req.params.email, req.params.value, "deposit");

});

app.get('/account/withdraw/:email/:value', function (req, res) {
    console.log(req.session);
    dal.updateOne(req.params.email, req.params.value)
    const now = new Date();
    dal.createHistory(now, req.params.email, req.params.value, "withdraw");
});



//all accounts
app.get('/account/all/:email', function(req, res) {
    dal.allHistory(req.params.email).
        then((docs) => {
            console.log(docs);

            res.send(JSON.stringify(docs));
        });
});

app.listen(PORT);
console.log('Running on port: ' + PORT);