const db = require("../config/db");

const getCategoriesByTypeAndUser = async (userId, type) => {
  let query = `SELECT * FROM categories WHERE (user_id = ? OR user_id IS NULL)`;
  const queryParams = [userId];

  if (type) {
    query += ` AND type = ?`;
    queryParams.push(type);
  }

  query += ` ORDER BY user_id DESC, name ASC`;

  const [rows] = await db.query(query, queryParams);
  return rows;
};

exports.createCategory = async (req, res) => {
  const userId = req.user.userId;
  const { type } = req.params;
  const { icon_res, color_res, name } = req.body;

  try {
    if (!['income', 'expense', 'savingGoal'].includes(type)) {
      return res.status(400).json({ message: "Invalid category type provided in URL." });
    }

    const result = await db.query(
      `INSERT INTO categories (user_id, icon_res, color_res, type, name)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, icon_res, color_res, type, name]
    );

    const insertedId = result[0].insertId;

    const [rows] = await db.query(
      `SELECT * FROM categories WHERE category_id = ?`,
      [insertedId]
    );

    if (rows.length > 0) {
      res.status(201).json({
        message: `Category '${type}' created successfully`,
        category_id: rows[0].category_id,
        user_id: rows[0].user_id,
        icon_res: rows[0].icon_res,
        color_res: rows[0].color_res,
        type: rows[0].type,
        name: rows[0].name
      });
    } else {
      res.status(500).json({ error: "Failed to retrieve created category after insertion." });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCategories = async (req, res) => {
  const userId = req.user.userId;
  const type = req.query.type; 

  try {
    if (type && !['income', 'expense', 'savingGoal'].includes(type)) { 
      return res.status(400).json({ message: "Invalid category type provided in query." });
    }

    const categories = await getCategoriesByTypeAndUser(userId, type); 
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  const { id } = req.params; 
  const { icon_res, color_res, name } = req.body; 
  const userId = req.user.userId;

  try {
    const [categoryRows] = await db.query(
      `SELECT user_id, type FROM categories WHERE category_id = ?`, 
      [id]
    );

    if (categoryRows.length === 0) {
      return res.status(404).json({ message: "Category not found." });
    }

    const categoryUserId = categoryRows[0].user_id;

    if (categoryUserId === null) {
      return res.status(403).json({ message: "Cannot update default categories." });
    }

    if (categoryUserId !== userId) {
      return res.status(403).json({ message: "Forbidden: You do not own this category." });
    }

    await db.query(
      `UPDATE categories
       SET icon_res = ?, color_res = ?, name = ?
       WHERE category_id = ?`,
      [icon_res, color_res, name, id]
    );

    const [updatedCategoryRows] = await db.query(
      `SELECT * FROM categories WHERE category_id = ?`,
      [id]
    );

    if (updatedCategoryRows.length > 0) {
      res.json({
        message: "Category updated successfully",
        category_id: updatedCategoryRows[0].category_id,
        user_id: updatedCategoryRows[0].user_id,
        icon_res: updatedCategoryRows[0].icon_res,
        color_res: updatedCategoryRows[0].color_res,
        type: updatedCategoryRows[0].type, 
        name: updatedCategoryRows[0].name
      });
    } else {
      res.status(500).json({ error: "Failed to retrieve updated category." });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const [categoryRows] = await db.query(
      `SELECT user_id FROM categories WHERE category_id = ?`,
      [id]
    );

    if (categoryRows.length === 0) {
      return res.status(404).json({ message: "Category not found." });
    }

    const categoryUserId = categoryRows[0].user_id;

    if (categoryUserId === null) {
      return res.status(403).json({ message: "Cannot delete default categories." });
    }

    if (categoryUserId !== userId) {
      return res.status(403).json({ message: "Forbidden: You do not own this category." });
    }

    await db.query(
      `DELETE FROM categories WHERE category_id = ?`,
      [id]
    );
    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
