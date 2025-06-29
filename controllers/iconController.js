const db = require("../config/db");

// Lấy tất cả icon
exports.getAllIcons = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM icons");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạo icon mới
exports.createIcon = async (req, res) => {
  const { color_id } = req.body;
  if (!color_id) {
    return res.status(400).json({ error: "color_id is required" });
  }

  try {
    const [result] = await db.query("INSERT INTO icons (color_id) VALUES (?)", [
      color_id,
    ]);
    res.status(201).json({ message: "Icon created", icon_id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật icon
exports.updateIcon = async (req, res) => {
  const { id } = req.params;
  const { color_id } = req.body;

  if (!color_id) {
    return res.status(400).json({ error: "color_id is required" });
  }

  try {
    await db.query("UPDATE icons SET color_id = ? WHERE icon_id = ?", [
      color_id,
      id,
    ]);
    res.json({ message: "Icon updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xoá icon
exports.deleteIcon = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM icons WHERE icon_id = ?", [id]);
    res.json({ message: "Icon deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
