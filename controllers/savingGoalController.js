const db = require("../config/db");

// Lấy tất cả saving goals của user
exports.getSavingGoals = async (req, res) => {
  const userId = req.user.userId;

  try {
    const [rows] = await db.query(
      `SELECT * FROM saving_goals WHERE user_id = ? ORDER BY target_date ASC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạo một saving goal mới
exports.createSavingGoal = async (req, res) => {
  const userId = req.user.userId;
  const {
    category_id,
    name,
    description,
    current_amount,
    target_amount,
    target_date,
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO saving_goals (user_id, category_id, name, description, current_amount, target_amount, target_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        category_id,
        name,
        description,
        current_amount,
        target_amount,
        target_date,
      ]
    );

    const insertedId = result[0].insertId;

    const [rows] = await db.query(
      `SELECT * FROM saving_goals WHERE goal_id = ?`,
      [insertedId]
    );

    if (rows.length > 0) {
      res.status(201).json({
        message: "Saving goal created successfully",
        ...rows[0],
      });
    } else {
      res
        .status(500)
        .json({
          error: "Failed to retrieve created saving goal after insertion.",
        });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật saving goal
exports.updateSavingGoal = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;
  const {
    category_id,
    name,
    description,
    current_amount,
    target_amount,
    target_date,
  } = req.body;

  try {
    const [goalRows] = await db.query(
      `SELECT user_id FROM saving_goals WHERE goal_id = ?`,
      [id]
    );

    if (goalRows.length === 0) {
      return res.status(404).json({ message: "Saving goal not found." });
    }

    if (goalRows[0].user_id !== userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not own this saving goal." });
    }

    await db.query(
      `UPDATE saving_goals 
       SET category_id = ?, name = ?, description = ?, current_amount = ?, target_amount = ?, target_date = ?
       WHERE goal_id = ?`,
      [
        category_id,
        name,
        description,
        current_amount,
        target_amount,
        target_date,
        id,
      ]
    );

    const [updatedRows] = await db.query(
      `SELECT * FROM saving_goals WHERE goal_id = ?`,
      [id]
    );

    if (updatedRows.length > 0) {
      res.json({
        message: "Saving goal updated successfully",
        ...updatedRows[0],
      });
    } else {
      res
        .status(500)
        .json({ error: "Failed to retrieve updated saving goal." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xoá saving goal
exports.deleteSavingGoal = async (req, res) => {
  const userId = req.user.userId;
  const { id } = req.params;

  try {
    const [goalRows] = await db.query(
      `SELECT user_id FROM saving_goals WHERE goal_id = ?`,
      [id]
    );

    if (goalRows.length === 0) {
      return res.status(404).json({ message: "Saving goal not found." });
    }

    if (goalRows[0].user_id !== userId) {
      return res
        .status(403)
        .json({ message: "Forbidden: You do not own this saving goal." });
    }

    await db.query(`DELETE FROM saving_goals WHERE goal_id = ?`, [id]);

    res.json({ message: "Saving goal deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
