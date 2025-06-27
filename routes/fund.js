const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM funds');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { name, amount, members, description } = req.body;
  const [result] = await db.query(
    `INSERT INTO funds 
     (name, amount, members, description, created_at, updated_at) 
     VALUES (?, ?, ?, ?, NOW(), NOW())`,
    [name, amount, JSON.stringify(members), description]
  );
  res.json({ id: result.insertId });
});

module.exports = router;
