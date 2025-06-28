const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM transactions');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { user_id, category_id, amount, description, date, source, image_url, warning } = req.body;
  const [result] = await db.query(
    `INSERT INTO transactions 
     (user_id, category_id, amount, description, date, source, image_url, warning) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [user_id, category_id, amount, description, date, source, image_url, warning]
  );
  res.json({ id: result.insertId });
});

module.exports = router;
