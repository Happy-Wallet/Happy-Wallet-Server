const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM transactions");
  res.json(rows);
});

router.post("/", async (req, res) => {
  const { user_id, category_id, icon_id, amount, description, date } = req.body;

  // Validate bắt buộc
  if (!user_id || !category_id || !icon_id || amount == null) {
    return res.status(400).json({
      error: "Missing required fields: user_id, category_id, icon_id, amount",
    });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO transactions 
        (user_id, category_id, icon_id, amount, description, date) 
       VALUES (?, ?, ?, ?, ?, ?);`,
      [
        user_id,
        category_id,
        icon_id,
        amount,
        description || null,
        date || new Date(), // nếu client không gửi date, hệ thống tự lấy NOW()
      ]
    );
    res.status(201).json({
      message: "Transaction created",
      transaction_id: result.insertId,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;
