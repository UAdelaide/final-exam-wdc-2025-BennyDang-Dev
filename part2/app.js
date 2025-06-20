const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();

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

app.get("/index.html",(req,res, next) => {
    const { authenticated, role } = req.session;
    if(authenticated){
       if(role === "owner"){
        res.redirect(301,"/owner-dashboard.html");
       }else if (role === "walker"){
        res.redirect(301,"/waker-dashboard.html");
       }
    }else{
        next();
    }
});

app.get("/owner-dashboard.html",(req,res, next) => {
    const { authenticated, role } = req.session;
    if(authenticated){
       if(role === "owner"){
        res.redirect(301,"/owner-dashboard.html");
       }else if (role === "walker"){
        res.redirect(301,"/waker-dashboard.html");
       }
    }else{
        next();
    }
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');
const { nextTick } = require('process');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;
