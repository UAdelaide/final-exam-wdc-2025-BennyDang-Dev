const express = require('express');
const path = require('path');
const session = require('express-session');
const logger = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(logger('dev'));

app.use(session({
    // * Generated randomly from https://random.org
    secret: 'hZsUxpJ4B8PUNYfHKcDHwf5TJsm2mUZe', // Used to COMPUTE HASH
    resave: true, // repeat the session or not
    // have all sessions have a session attached to
    // them, even if we haven't initialised it
    saveUninitialized: true,
    // session cookie works i http
    cookie: { secure: false }
}));

// * Checking if they have permission
app.get("/walker-dashboard.html", (req,res,next) => {
    const { authenticated, role } = req.session;
    if(authenticated){
       if(role === "walker"){
        next();
       }
    }else{
        res.redirect(301,"/index.html");
    }
});

// * Checking if they have permission
app.get("/owner-dashboard.html",(req,res, next) => {
    const { authenticated, role } = req.session;
    if(authenticated){
       if(role === "owner"){
        next();
       }else{
        res.redirect(301,"/index.html");
       }
    }else{
        res.redirect(301,"/index.html");
    }
});

// * If they access index.html then if the session is active
// * They will be redirected to their dashboard without having to
// * re login
app.get("/index.html",(req,res, next) => {
    const { authenticated, role } = req.session;
    if(authenticated){
       if(role === "owner"){
        res.redirect(301,"/owner-dashboard.html");
       }else if (role === "walker"){
        res.redirect(301,"/walker-dashboard.html");
       }
    }else{
        next();
    }
});

app.use(express.static(path.join(__dirname, '/public')));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');
const { nextTick } = require('process');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;
