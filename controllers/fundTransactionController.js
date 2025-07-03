const db = require("../config/db");

async function isAdminOfFund(userId, fundId) {
    const [rows] = await db.query(
        `SELECT role FROM funds_members WHERE fund_id = ? AND user_id = ? AND status = 'accepted'`,
        [fundId, userId]
    );
    return rows.length > 0 && rows[0].role === 'Admin';
}

exports.createFundTransaction = async (req, res) => {
    const { fundId } = req.params;
    const userId = req.user.userId; // Người tạo giao dịch
    const { amount, type, description, category_id } = req.body; // THÊM category_id

    if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Số tiền không hợp lệ." });
    }
    if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ message: "Loại giao dịch quỹ không hợp lệ. Phải là 'income' hoặc 'expense'." });
    }
    if (!category_id) {
        return res.status(400).json({ message: "Category là bắt buộc." });
    }


    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [memberRows] = await connection.query(
            `SELECT * FROM funds_members WHERE fund_id = ? AND user_id = ? AND status = 'accepted'`,
            [fundId, userId]
        );

        if (memberRows.length === 0) {
            await connection.rollback();
            return res.status(403).json({ message: "Bạn không phải là thành viên của quỹ này." });
        }

        if (category_id) {
            const [categoryRows] = await connection.query(
                `SELECT category_id, type FROM categories WHERE category_id = ?`,
                [category_id]
            );
            if (categoryRows.length === 0) {
                await connection.rollback();
                return res.status(400).json({ message: "Category ID không hợp lệ." });
            }
            if (categoryRows[0].type !== type) {
                await connection.rollback();
                return res.status(400).json({ message: "Category type không khớp với transaction type." });
            }
        }


        const result = await connection.query(
            `INSERT INTO fund_transactions (fund_id, user_id, amount, type, description, category_id)
             VALUES (?, ?, ?, ?, ?, ?)`, 
            [fundId, userId, amount, type, description, category_id]
        );

        const newFundTransactionId = result[0].insertId;

        const updateAmountQuery = type === 'income'
            ? `UPDATE funds SET current_amount = current_amount + ? WHERE fund_id = ?`
            : `UPDATE funds SET current_amount = current_amount - ? WHERE fund_id = ?`;

        await connection.query(updateAmountQuery, [amount, fundId]);

        await connection.commit();

        const [newTransactionRows] = await db.query(
            `SELECT ft.*, u.username, u.email, c.icon_res, c.color_res, c.name AS category_name, c.type AS category_type
             FROM fund_transactions ft
             JOIN users u ON ft.user_id = u.user_id
             LEFT JOIN categories c ON ft.category_id = c.category_id
             WHERE ft.fund_transaction_id = ?`,
            [newFundTransactionId]
        );

        res.status(201).json({
            message: "Giao dịch quỹ đã được tạo thành công.",
            transaction: newTransactionRows[0]
        });

    } catch (err) {
        if (connection) {
            await connection.rollback();
        }
        console.error("Lỗi khi tạo giao dịch quỹ:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

exports.getFundTransactions = async (req, res) => {
    const { fundId } = req.params;
    const userId = req.user.userId;

    try {
        const [memberRows] = await db.query(
            `SELECT * FROM funds_members WHERE fund_id = ? AND user_id = ? AND status = 'accepted'`,
            [fundId, userId]
        );

        if (memberRows.length === 0) {
            return res.status(403).json({ message: "Bạn không phải là thành viên của quỹ này." });
        }

        const [transactions] = await db.query(
            `SELECT ft.*, u.username, u.email, u.avatar_url, c.icon_res, c.color_res, c.name AS category_name, c.type AS category_type
             FROM fund_transactions ft
             JOIN users u ON ft.user_id = u.user_id
             LEFT JOIN categories c ON ft.category_id = c.category_id -- JOIN THÊM BẢNG CATEGORIES
             WHERE ft.fund_id = ?
             ORDER BY ft.created_at DESC`,
            [fundId]
        );

        const formattedTransactions = transactions.map(t => ({
            fund_transaction_id: t.fund_transaction_id,
            fund_id: t.fund_id,
            user_id: t.user_id,
            amount: t.amount,
            type: t.type,
            description: t.description,
            created_at: t.created_at,
            updated_at: t.updated_at,
            username: t.username,
            email: t.email,
            avatar_url: t.avatar_url,
            category: { 
                category_id: t.category_id,
                icon_res: t.icon_res,
                color_res: t.color_res,
                type: t.category_type,
                name: t.category_name
            }
        }));


        res.status(200).json(formattedTransactions);

    } catch (err) {
        console.error("Lỗi khi lấy giao dịch quỹ:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.updateFundTransaction = async (req, res) => {
    const { fundId, transactionId } = req.params;
    const userId = req.user.userId; // Người thực hiện cập nhật
    const { amount, type, description, category_id } = req.body; // THÊM category_id

    if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Số tiền không hợp lệ." });
    }
    if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({ message: "Loại giao dịch quỹ không hợp lệ. Phải là 'income' hoặc 'expense'." });
    }

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const userIsAdmin = await isAdminOfFund(userId, fundId);
        if (!userIsAdmin) {
            await connection.rollback();
            return res.status(403).json({ message: "Không có quyền: Bạn không phải là quản trị viên của quỹ này." });
        }

        if (category_id) {
            const [categoryRows] = await connection.query(
                `SELECT category_id, type FROM categories WHERE category_id = ?`,
                [category_id]
            );
            if (categoryRows.length === 0) {
                await connection.rollback();
                return res.status(400).json({ message: "Category ID không hợp lệ." });
            }
            if (categoryRows[0].type !== type) {
                 await connection.rollback();
                return res.status(400).json({ message: "Category type không khớp với transaction type." });
            }
        }

        const [oldTransactionRows] = await connection.query(
            `SELECT amount, type FROM fund_transactions WHERE fund_transaction_id = ? AND fund_id = ?`,
            [transactionId, fundId]
        );

        if (oldTransactionRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Không tìm thấy giao dịch quỹ." });
        }
        const oldAmount = oldTransactionRows[0].amount;
        const oldType = oldTransactionRows[0].type;

        let updateAmountQuery = '';
        if (oldType === 'income' && type === 'income') {
            updateAmountQuery = `UPDATE funds SET current_amount = current_amount - ? + ? WHERE fund_id = ?`;
        } else if (oldType === 'expense' && type === 'expense') {
            updateAmountQuery = `UPDATE funds SET current_amount = current_amount + ? - ? WHERE fund_id = ?`;
        } else if (oldType === 'income' && type === 'expense') {
            updateAmountQuery = `UPDATE funds SET current_amount = current_amount - ? - ? WHERE fund_id = ?`;
        } else if (oldType === 'expense' && type === 'income') {
            updateAmountQuery = `UPDATE funds SET current_amount = current_amount + ? + ? WHERE fund_id = ?`;
        }
        await connection.query(updateAmountQuery, [oldAmount, amount, fundId]);

        await connection.query(
            `UPDATE fund_transactions
             SET amount = ?, type = ?, description = ?, category_id = ?, updated_at = CURRENT_TIMESTAMP -- THÊM category_id
             WHERE fund_transaction_id = ? AND fund_id = ?`,
            [amount, type, description, category_id, transactionId, fundId]
        );

        await connection.commit();

        const [updatedTransactionRows] = await db.query(
            `SELECT ft.*, u.username, u.email, c.icon_res, c.color_res, c.name AS category_name, c.type AS category_type
             FROM fund_transactions ft
             JOIN users u ON ft.user_id = u.user_id
             LEFT JOIN categories c ON ft.category_id = c.category_id
             WHERE ft.fund_transaction_id = ?`,
            [transactionId]
        );

        res.status(200).json({
            message: "Giao dịch quỹ đã được cập nhật thành công.",
            transaction: updatedTransactionRows[0]
        });

    } catch (err) {
        if (connection) {
            await connection.rollback();
        }
        console.error("Lỗi khi cập nhật giao dịch quỹ:", err);
        res.status(500).json({ error: err.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

exports.deleteFundTransaction = async (req, res) => {
    const { fundId, transactionId } = req.params;
    const userId = req.user.userId; 

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const userIsAdmin = await isAdminOfFund(userId, fundId);
        if (!userIsAdmin) {
            await connection.rollback();
            return res.status(403).json({ message: "Không có quyền: Bạn không phải là quản trị viên của quỹ này." });
        }

        const [transactionRows] = await connection.query(
            `SELECT amount, type FROM fund_transactions WHERE fund_transaction_id = ? AND fund_id = ?`,
            [transactionId, fundId]
        );

        if (transactionRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Không tìm thấy giao dịch quỹ." });
        }
        const { amount, type } = transactionRows[0];

        const updateAmountQuery = type === 'income'
            ? `UPDATE funds SET current_amount = current_amount - ? WHERE fund_id = ?`
            : `UPDATE funds SET current_amount = current_amount + ? WHERE fund_id = ?`;
        await connection.query(updateAmountQuery, [amount, fundId]);

        await connection.query(
            `DELETE FROM fund_transactions WHERE fund_transaction_id = ? AND fund_id = ?`,
            [transactionId, fundId]
        );

        await connection.commit();
        res.status(200).json({ message: "Giao dịch quỹ đã được xóa thành công." });

    } catch (err) {
        if (connection) {
            await connection.rollback();
        }
        console.error("Lỗi khi xóa giao dịch quỹ:", err);
        res.status(500).json({ message: 'Không thể xóa giao dịch quỹ.', error: err.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

exports.getMemberContributions = async (req, res) => {
    const { fundId } = req.params;
    const userId = req.user.userId;

    try {
        const [memberRows] = await db.query(
            `SELECT * FROM funds_members WHERE fund_id = ? AND user_id = ? AND status = 'accepted'`,
            [fundId, userId]
        );

        if (memberRows.length === 0) {
            return res.status(403).json({ message: "Bạn không phải là thành viên của quỹ này." });
        }

        const [contributions] = await db.query(
            `SELECT u.user_id, u.username, u.email, u.avatar_url, SUM(ft.amount) AS total_contribution
             FROM fund_transactions ft
             JOIN users u ON ft.user_id = u.user_id
             WHERE ft.fund_id = ? AND ft.type = 'income'
             GROUP BY u.user_id, u.username, u.email, u.avatar_url
             ORDER BY total_contribution DESC`,
            [fundId]
        );

        res.status(200).json(contributions);

    } catch (err) {
        console.error("Lỗi khi lấy tổng đóng góp của thành viên:", err);
        res.status(500).json({ error: err.message });
    }
};