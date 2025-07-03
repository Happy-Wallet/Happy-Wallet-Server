const db = require('../config/db');

exports.createFund = async (req, res) => {
  const { name, description, has_target, target_amount, target_end_date } = req.body;
  const created_by_user_id = req.user.userId;

  const current_amount = 0.00;

  if (!name) {
    return res.status(400).json({ message: 'Tên quỹ là bắt buộc.' });
  }

  if (has_target) {
    if (!target_amount || !target_end_date) {
      return res.status(400).json({ message: 'Số tiền mục tiêu và ngày kết thúc là bắt buộc cho quỹ có mục tiêu.' });
    }
    if (new Date(target_end_date) <= new Date()) {
      return res.status(400).json({ message: 'Ngày kết thúc mục tiêu phải ở trong tương lai.' });
    }
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const fundInsertResult = await connection.query(
      `INSERT INTO funds (name, description, created_by_user_id, current_amount, has_target, target_amount, target_end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description,
        created_by_user_id,
        current_amount,
        has_target ? 1 : 0,
        has_target ? target_amount : null,
        has_target ? target_end_date : null
      ]
    );

    const newFundId = fundInsertResult[0].insertId;

    await connection.query(
      `INSERT INTO funds_members (fund_id, user_id, role, status)
       VALUES (?, ?, ?, ?)`,
      [newFundId, created_by_user_id, 'Admin', 'accepted']
    );

    await connection.commit();

    const [newFundRows] = await db.query('SELECT * FROM funds WHERE fund_id = ?', [newFundId]);
    const newFund = newFundRows[0];

    res.status(201).json({ message: 'Quỹ đã được tạo thành công!', fund: newFund });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Lỗi khi tạo quỹ:', error);
    res.status(500).json({ message: 'Không thể tạo quỹ.', error: error.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

exports.getAllFunds = async (req, res) => {
  const userId = req.user.userId;

  try {
    const [funds] = await db.query(
      `SELECT f.*, u.email AS creator_email, u.username AS creator_username
       FROM funds f
       JOIN funds_members fm ON f.fund_id = fm.fund_id
       LEFT JOIN users u ON f.created_by_user_id = u.user_id
       WHERE fm.user_id = ? AND fm.status = 'accepted'
       ORDER BY f.created_at DESC`,
      [userId]
    );

    const formattedFunds = funds.map(fund => ({
        ...fund,
        has_target: fund.has_target === 1 

    }));


    for (let fund of formattedFunds) { // Sử dụng formattedFunds ở đây
      const [membersRows] = await db.query(
        `SELECT fm.user_id, fm.role, fm.status, u.email, u.username
         FROM funds_members fm
         JOIN users u ON fm.user_id = u.user_id
         WHERE fm.fund_id = ? AND fm.status = 'accepted'`,
        [fund.fund_id]
      );
      fund.members = membersRows;
    }

    res.status(200).json(formattedFunds);

  } catch (error) {
    console.error('Lỗi khi lấy danh sách quỹ:', error);
    res.status(500).json({ message: 'Không thể lấy danh sách quỹ.', error: error.message });
  }
};

exports.getFundDetails = async (req, res) => {
  const fundId = req.params.fundId;
  const userId = req.user.userId;
  console.log(`DEBUG: API GET /funds/${fundId} called for userId: ${userId}`);

  try {
    const [memberRows] = await db.query(
      `SELECT * FROM funds_members WHERE fund_id = ? AND user_id = ? AND (status = 'accepted' OR status = 'pending')`,
      [fundId, userId]
    );

    if (memberRows.length === 0) {
      console.warn(`WARN: User ${userId} is not an accepted or pending member of fund ${fundId}.`);
      return res.status(403).json({ message: 'Không có quyền: Bạn không phải là thành viên hoặc lời mời của bạn chưa được chấp nhận.' });
    }

    const [fundRows] = await db.query(
      `SELECT f.*, u.email AS creator_email, u.username AS creator_username
       FROM funds f
       LEFT JOIN users u ON f.created_by_user_id = u.user_id
       WHERE f.fund_id = ?`,
      [fundId]
    );

    if (fundRows.length === 0) {
      console.warn(`WARN: Fund ${fundId} not found.`);
      return res.status(404).json({ message: 'Không tìm thấy quỹ.' });
    }
    let fund = fundRows[0];

    fund.has_target = fund.has_target === 1;


    const [membersRows] = await db.query(
      `SELECT fm.user_id, fm.role, fm.status, u.email, u.username
       FROM funds_members fm
       JOIN users u ON fm.user_id = u.user_id
       WHERE fm.fund_id = ? AND fm.status = 'accepted'`, // Vẫn giữ 'accepted' nếu bạn chỉ muốn hiển thị thành viên chính thức
      [fundId]
    );
    fund.members = membersRows;
    console.log(`DEBUG: Fund ${fundId} details fetched successfully.`);
    console.log('DEBUG: Formatted Fund data:', fund); // Log dữ liệu đã format
    res.status(200).json(fund); // Gửi dữ liệu đã format

  } catch (error) {
    console.error('Lỗi khi lấy chi tiết quỹ:', error);
    res.status(500).json({ message: 'Không thể lấy chi tiết quỹ.', error: error.message });
  }
};

exports.updateFund = async (req, res) => {
  const fundId = req.params.fundId;
  const userId = req.user.userId;
  const { name, description, target_amount, target_end_date } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Tên quỹ là bắt buộc.' });
  }

  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [memberRows] = await connection.query(
      `SELECT * FROM funds_members WHERE fund_id = ? AND user_id = ? AND role = 'Admin' AND status = 'accepted'`,
      [fundId, userId]
    );

    if (memberRows.length === 0) {
      await connection.rollback();
      return res.status(403).json({ message: 'Không có quyền: Bạn không phải là quản trị viên của quỹ này.' });
    }

    const [currentFundRows] = await connection.query(
        `SELECT has_target FROM funds WHERE fund_id = ?`,
        [fundId]
    );

    if (currentFundRows.length === 0) {
        await connection.rollback();
        return res.status(404).json({ message: 'Không tìm thấy quỹ.' });
    }

    const currentHasTarget = currentFundRows[0].has_target;

    let finalTargetAmount = null;
    let finalTargetEndDate = null;

    if (currentHasTarget === 1) {
        if (!target_amount || !target_end_date) {
            await connection.rollback();
            return res.status(400).json({ message: 'Số tiền mục tiêu và ngày kết thúc là bắt buộc cho quỹ có mục tiêu.' });
        }
        if (new Date(target_end_date) <= new Date()) {
            await connection.rollback();
            return res.status(400).json({ message: 'Ngày kết thúc mục tiêu phải ở trong tương lai.' });
        }
        finalTargetAmount = target_amount;
        finalTargetEndDate = target_end_date;
    }

    await connection.query(
      `UPDATE funds
       SET name = ?, description = ?, target_amount = ?, target_end_date = ?, updated_at = CURRENT_TIMESTAMP
       WHERE fund_id = ?`,
      [
        name,
        description,
        finalTargetAmount,
        finalTargetEndDate,
        fundId
      ]
    );

    await connection.commit();

    res.status(200).json({ message: 'Quỹ đã được cập nhật thành công!' });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }
    console.error('Lỗi khi cập nhật quỹ:', error);
    res.status(500).json({ message: 'Không thể cập nhật quỹ.', error: error.message });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};