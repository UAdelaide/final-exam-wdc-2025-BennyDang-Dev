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
    secret: 'string of your choice', // Used to COMPUTE HASH
    resave: false, // repeat the session or not
    // have all sessions have a session attached to
    //them, even if we haven't initialised it
    saveUninitialized: true,
    // session cookie only work in https
    cookie: {secure: false}
}));

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// Export the app instead of listening here
module.exports = app;