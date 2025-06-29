// routes/user.js
const express = require("express");
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');

// GET /users
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /users
router.post('/', async (req, res) => {
  const { email, username, password, role, date_of_birth } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      `INSERT INTO users (email, username, hashed_password, role, date_of_birth, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [email, username, hashedPassword, role || 'user', date_of_birth]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
