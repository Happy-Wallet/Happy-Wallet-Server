const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM categories");
  res.json(rows);
});

router.post("/", async (req, res) => {
  const { user_id, icon_id, name, is_default } = req.body;
  if (!icon_id) {
    return res.status(400).json({ error: "icon_id is required" });
  }
  const [result] = await db.query(
    "INSERT INTO categories (user_id, icon_id, name, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, NOW(), NOW())",
    [user_id, icon_id, name, is_default]
  );
  res.json({ id: result.insertId });
});

module.exports = router;
