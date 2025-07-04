const db = require("../config/db");

exports.addFundActivity = async (req, res) => {
  const { fundId, transactionId, fundTransactionId, activityType, amount, description } = req.body;
  const userId = req.user.userId; 

  try {
    const [fundRows] = await db.query("SELECT * FROM funds WHERE fund_id = ? AND deleted_at IS NULL", [fundId]);
    if (fundRows.length === 0) {
      return res.status(404).json({ message: "Fund not found" });
    }

    const [memberRows] = await db.query("SELECT * FROM funds_members WHERE fund_id = ? AND user_id = ? AND status = 'accepted' AND deleted_at IS NULL", [fundId, userId]);
    if (memberRows.length === 0) {
      return res.status(403).json({ message: "User is not a member of this fund or invitation not accepted." });
    }

    await db.query(
      "INSERT INTO fund_activities (fund_id, user_id, transaction_id, fund_transaction_id, activity_type, amount, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [fundId, userId, transactionId, fundTransactionId, activityType, amount, description]
    );

    res.status(201).json({ message: "Fund activity added successfully" });
  } catch (err) {
    console.error("Error adding fund activity:", err);
    res.status(500).json({ error: "Server error adding fund activity." });
  }
};

exports.getFundActivitiesByFund = async (req, res) => {
  const { fundId } = req.params;
  const userId = req.user.userId;

  try {
    const [memberRows] = await db.query("SELECT * FROM funds_members WHERE fund_id = ? AND user_id = ? AND status = 'accepted' AND deleted_at IS NULL", [fundId, userId]);
    if (memberRows.length === 0) {
      return res.status(403).json({ message: "You are not authorized to view activities for this fund." });
    }

    const [activities] = await db.query(`
      SELECT fa.*, u.username, u.avatar_url,
             t.amount AS transaction_amount, t.description AS transaction_description, t.type AS transaction_type,
             ft.amount AS fund_transaction_amount, ft.description AS fund_transaction_description, ft.type AS fund_transaction_type
      FROM fund_activities fa
      JOIN users u ON fa.user_id = u.user_id
      LEFT JOIN transactions t ON fa.transaction_id = t.transaction_id
      LEFT JOIN fund_transactions ft ON fa.fund_transaction_id = ft.fund_transaction_id
      WHERE fa.fund_id = ?
      ORDER BY fa.created_at DESC
    `, [fundId]);
    res.json(activities);
  } catch (err) {
    console.error("Error fetching fund activities by fund:", err);
    res.status(500).json({ error: "Server error fetching fund activities." });
  }
};

exports.getUserFundActivities = async (req, res) => {
  const userId = req.user.userId;

  try {
    const [activities] = await db.query(`
      SELECT fa.*, f.name AS fund_name, u.username, u.avatar_url,
             t.amount AS transaction_amount, t.description AS transaction_description, t.type AS transaction_type,
             ft.amount AS fund_transaction_amount, ft.description AS fund_transaction_description, ft.type AS fund_transaction_type
      FROM fund_activities fa
      JOIN funds f ON fa.fund_id = f.fund_id
      JOIN users u ON fa.user_id = u.user_id
      LEFT JOIN transactions t ON fa.transaction_id = t.transaction_id
      LEFT JOIN fund_transactions ft ON fa.fund_transaction_id = ft.fund_transaction_id
      WHERE fa.user_id = ?
      ORDER BY fa.created_at DESC
    `, [userId]);
    res.json(activities);
  } catch (err) {
    console.error("Error fetching user fund activities:", err);
    res.status(500).json({ error: "Server error fetching user fund activities." });
  }
};