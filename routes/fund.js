const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET /funds
router.get("/", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM funds");
  res.json(rows);
});

// POST /funds
router.post("/", async (req, res) => {
  const {
    category_id,
    name,
    current_amount,
    has_target,
    target_amount,
    description,
  } = req.body;

  if (!category_id || !name || current_amount == null) {
    return res.status(400).json({
      error: "Missing required fields: category_id, name, current_amount",
    });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO funds 
        (category_id, name, current_amount, has_target, target_amount, description) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        category_id,
        name,
        current_amount,
        has_target == null ? 1 : has_target,
        target_amount || 0,
        description || null,
      ]
    );
    res.status(201).json({ message: "Fund created", fund_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
