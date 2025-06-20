const express = require('express');
const path = require('path');
const session = require('express-session');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

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

app.get("/owner-dashboard.html",(req,res) => {
    const { authenticated, role } = req.session;
    console.log(authenticated, role);
});

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;
