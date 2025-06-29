const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM saving_goals");
  res.json(rows);
});

router.post("/", async (req, res) => {
  const { user_id, icon_id, name, current_amount, target_amount } = req.body;

  if (!user_id || !icon_id || !name || current_amount == null) {
    return res.status(400).json({
      error: "Missing required fields: user_id, icon_id, name, current_amount",
    });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO saving_goals 
        (user_id, icon_id, name, current_amount, target_amount) 
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, icon_id, name, current_amount, target_amount || 0]
    );
    res
      .status(201)
      .json({ message: "Saving goal created", goal_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
