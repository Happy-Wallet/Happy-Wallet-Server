const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET /categories
router.get("/", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM categories");
  res.json(rows);
});

// POST /categories
router.post('/', async (req, res) => {
  const { user_id, name, type, icon_res, color_res, is_default } = req.body;

  try {
    const [result] = await db.query(
      `INSERT INTO categories (user_id, name, type, icon_res, color_res, is_default, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [
        user_id, 
        name, 
        type, 
        icon_res, 
        color_res, 
        is_default 
      ]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
