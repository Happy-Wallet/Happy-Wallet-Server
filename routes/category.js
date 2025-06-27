const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM categories');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { user_id, name, is_default } = req.body;
  const [result] = await db.query(
    'INSERT INTO categories (user_id, name, is_default, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
    [user_id, name, is_default]
  );
  res.json({ id: result.insertId });
});

module.exports = router;
