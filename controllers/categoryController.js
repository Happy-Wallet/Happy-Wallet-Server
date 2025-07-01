const db = require("../config/db");

exports.createCategory = async (req, res) => {
  const { user_id, icon_res, color_res, type, name, is_default } = req.body;
  try {
    await db.query(
      `INSERT INTO categories (user_id, icon_res, color_res, type, name, is_default) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, icon_res, color_res, type, name, is_default ?? true]
    );
    res.status(201).json({ message: "Category created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllCategories = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT * FROM categories
      WHERE deleted_at IS NULL
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategoriesByUser = async (req, res) => {
  const { user_id } = req.params;
  try {
    const [rows] = await db.query(
      `SELECT * FROM categories 
       WHERE (user_id = ? OR is_default = TRUE) AND deleted_at IS NULL`,
      [user_id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params;
  const { icon_res, color_res, type, name } = req.body;
  try {
    await db.query(
      `UPDATE categories 
       SET icon_res = ?, color_res = ?, type = ?, name = ?, updated_at = NOW()
       WHERE category_id = ?`,
      [icon_res, color_res, type, name, id]
    );
    res.json({ message: "Category updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query(
      `UPDATE categories SET deleted_at = NOW() WHERE category_id = ?`,
      [id]
    );
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
