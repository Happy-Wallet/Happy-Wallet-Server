const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET /savingGoals
router.get("/", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM saving_goals");
  res.json(rows);
});

// POST /savingGoals
router.post("/", async (req, res) => {
  const { user_id, category_id, name, description, current_amount, target_amount, target_date } = req.body;

  if (!user_id || !category_id || !name || current_amount == null) {
    return res.status(400).json({
      error: "Missing required fields: user_id, category_id, name, current_amount",
    });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO saving_goals 
        (user_id, category_id, name, description, current_amount, target_amount, target_date) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id, 
        category_id, 
        name, 
        description, 
        current_amount || 0, 
        target_amount, 
        target_date || new Date() // nếu client không gửi date, hệ thống tự lấy NOW()
      ]
    );
    res
      .status(201)
      .json({ message: "Saving goal created", goal_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
