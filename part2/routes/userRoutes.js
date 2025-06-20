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

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const rowObj = rows[0];

    req.session.authenticated = true;
    req.session.userid = rowObj.user_id;
    req.session.role = rowObj.role;

    if(rowObj.role === 'owner'){
      res.status(301).json({ url: 'owner-dashboard.html' });
    }else{
      res.status(301).json({ url: 'walker-dashboard.html' });
    }


  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/logout',(req,res) => {
  try{
    req.session.destroy();
    console.log(req.session.user_id);
    res.redirect(301,"/index.html");
  }catch(error){
    // * Do nothing if it cant logout
    // * For some reasons
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

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});


module.exports = router;