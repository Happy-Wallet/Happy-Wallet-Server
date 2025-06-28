// routes/user.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// GET /users
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /users
router.post('/', async (req, res) => {
  const { email, username, role } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO users (email, username, role, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
      [email, username, role]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;