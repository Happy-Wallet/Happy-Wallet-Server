const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM saving_goals');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { user_id, name, amount, target, description, start_date, end_date } = req.body;
  const [result] = await db.query(
    `INSERT INTO saving_goals 
     (user_id, name, amount, target, description, created_at, updated_at, start_date, end_date) 
     VALUES (?, ?, ?, ?, ?, NOW(), NOW(), ?, ?)`,
    [user_id, name, amount, target, description, start_date, end_date]
  );
  res.json({ id: result.insertId });
});

module.exports = router;