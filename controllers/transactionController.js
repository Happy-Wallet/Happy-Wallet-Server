const db = require("../config/db"); 

exports.createTransaction = async (req, res) => {
  const userId = req.user.userId; 
  const { type } = req.params; 
  const { amount, category_id, date, description } = req.body; 

  try {
    if (!['income', 'expense', 'savingGoal'].includes(type)) {
      return res.status(400).json({ message: "Invalid transaction type in URL." });
    }

    const result = await db.query(
      `INSERT INTO transactions (user_id, amount, type, category_id, date, description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, amount, type, category_id, date, description]
    );

    const insertedId = result[0].insertId;

    const [newTransactionRows] = await db.query(
      `SELECT * FROM transactions WHERE transaction_id = ?`,
      [insertedId]
    );

    if (newTransactionRows.length > 0) {
      const newTransaction = newTransactionRows[0];

      const [categoryRows] = await db.query(
        `SELECT category_id, user_id, icon_res, color_res, type, name FROM categories WHERE category_id = ?`,
        [newTransaction.category_id]
      );
      const categoryInfo = categoryRows.length > 0 ? categoryRows[0] : null;

      res.status(201).json({
        message: "Transaction created successfully",
        transaction_id: newTransaction.transaction_id,
        user_id: newTransaction.user_id,
        amount: newTransaction.amount,
        type: newTransaction.type,
        category: categoryInfo,
        date: newTransaction.date,
        description: newTransaction.description
      });
    } else {
      res.status(500).json({ error: "Failed to retrieve created transaction." });
    }

  } catch (err) {
    console.error("Error creating transaction:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getTransactions = async (req, res) => {
  const userId = req.user.userId;
  const type = req.query.type; 

  try {
    let query = `
      SELECT t.*, c.icon_res, c.color_res, c.name AS category_name, c.type AS category_type
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.category_id
      WHERE t.user_id = ?
    `;
    const queryParams = [userId];

    if (type) {
      if (!['income', 'expense', 'savingGoal'].includes(type)) {
        return res.status(400).json({ message: "Invalid transaction type provided in query." });
      }
      query += ` AND t.type = ?`;
      queryParams.push(type);
    }

    query += ` ORDER BY t.date DESC`; 

    const [transactions] = await db.query(query, queryParams);

    const formattedTransactions = transactions.map(t => ({
      transaction_id: t.transaction_id,
      user_id: t.user_id,
      amount: t.amount,
      type: t.type,
      date: t.date,
      description: t.description,
      category: {
        category_id: t.category_id,
        icon_res: t.icon_res,
        color_res: t.color_res,
        type: t.category_type,
        name: t.category_name
      }
    }));

    res.json(formattedTransactions);
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateTransaction = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;
  const { amount, category_id, date, description } = req.body; 

  try {
    const [transactionRows] = await db.query(
      `SELECT user_id, type FROM transactions WHERE transaction_id = ?`,
      [id]
    );

    if (transactionRows.length === 0) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    if (transactionRows[0].user_id !== userId) {
      return res.status(403).json({ message: "Forbidden: You do not own this transaction." });
    }



    await db.query(
      `UPDATE transactions
       SET amount = ?, category_id = ?, date = ?, description = ?
       WHERE transaction_id = ?`, 
      [amount, category_id, date, description, id]
    );

    const [updatedTransactionRows] = await db.query(
      `SELECT * FROM transactions WHERE transaction_id = ?`,
      [id]
    );

    if (updatedTransactionRows.length > 0) {
      const updatedTransaction = updatedTransactionRows[0];

      const [categoryRows] = await db.query(
        `SELECT category_id, user_id, icon_res, color_res, type, name FROM categories WHERE category_id = ?`,
        [updatedTransaction.category_id]
      );
      const categoryInfo = categoryRows.length > 0 ? categoryRows[0] : null;

      res.json({
        message: "Transaction updated successfully",
        transaction_id: updatedTransaction.transaction_id,
        user_id: updatedTransaction.user_id,
        amount: updatedTransaction.amount,
        type: updatedTransaction.type, 
        category: categoryInfo, 
        date: updatedTransaction.date,
        description: updatedTransaction.description
      });
    } else {
      res.status(500).json({ error: "Failed to retrieve updated transaction." });
    }

  } catch (err) {
    console.error("Error updating transaction:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTransaction = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const [transactionRows] = await db.query(
      `SELECT user_id FROM transactions WHERE transaction_id = ?`,
      [id]
    );

    if (transactionRows.length === 0) {
      return res.status(404).json({ message: "Transaction not found." });
    }

    if (transactionRows[0].user_id !== userId) {
      return res.status(403).json({ message: "Forbidden: You do not own this transaction." });
    }

    await db.query(
      `DELETE FROM transactions WHERE transaction_id = ?`,
      [id]
    );
    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    console.error("Error deleting transaction:", err);
    res.status(500).json({ error: err.message });
  }
};
