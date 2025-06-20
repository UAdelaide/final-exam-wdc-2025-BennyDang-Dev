const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// * POST login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query(`
      SELECT user_id, username, role FROM Users
      WHERE username = ? AND password_hash = ?
    `, [username, password]);

    // console.log(rows);

    // * If no matching user, return error
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const rowObj = rows[0];

    // * Save details into session
    req.session.authenticated = true;
    req.session.userid = rowObj.user_id;
    req.session.role = rowObj.role;

    // * Redirect based on user role
    if(rowObj.role === 'owner'){
      res.status(301).json({ url: 'owner-dashboard.html' });
    }else{
      res.status(301).json({ url: 'walker-dashboard.html' });
    }
  } catch (error) {
    // * Catch error
    res.status(500).json({ error: 'Login failed' });
  }
});

// * User Logout
router.get('/logout',(req,res) => {
  try{
    req.session.destroy();
    // res.redirect(301,'/index.html');
    res.status(301).json({ url: "index.html" });
  }catch(error){
    // * Do nothing if it cant logout
    // console.log(error);
    res.sendStatus(500);
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);


    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// * Get userid for the front end
router.get('/me', (req, res) => {
  // if (!req.session.authenticated)
  if (!req.session.authenticated) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json({ userid: req.session.userid });
});

// * Get owner ids for index.html dog tables
router.post('/getOwnerIDs', async (req,res) => {
  // * Is array
  // const { usernames } = req.body;
  const usernames = ['alice123','bobwalker'];
  const query = `
    SELECT JSON_OBJECTAGG(username, user_id) AS userIDs
    FROM Users
    WHERE username IN ( ? )`;
  try {
    // * Fun fact this ONLY works in here db.execute will not for some reason at all
    // * Only reason I know this was this was the only method I used in the wdc project
    db.pool.getConnection(function(err1,connection){
      if(err1){
        res.status(500).json({ error: "Can't connect to db!" });
      }
      connection.query(query,[usernames],function(err2,rows,fields){
        connection.release();
        if(err2){
          return;
        }
        res.json(rows);
      });
    });
    // const [rows] = await db.execute(query,[["alice123"]]);
    // res.json(rows);
  }catch(error){
    res.status(500).json({ error: 'Can\' get user ids!' });
    console.log(error);
  }

});

module.exports = router;
