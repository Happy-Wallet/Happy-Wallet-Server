const db = require('../config/db');

const sendNotification = async (userId, title, message, data = {}) => {
    try {
        const notificationType = data.type || 'general'; 
        const resourceId = data.fundId || null; 

        await db.query(
            `INSERT INTO notifications (user_id, title, description, type, resource_id, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
            [userId, title, message, notificationType, resourceId]
        );
        console.log(`Đã lưu thông báo vào DB cho người dùng ${userId}: Tiêu đề: "${title}"`);
    } catch (error) {
        console.error('Lỗi khi lưu thông báo vào cơ sở dữ liệu:', error);
    }
};


exports.inviteMember = async (req, res) => {
    const fundId = req.params.fundId;
    const { email } = req.body;

    const inviterUserId = req.user.userId;
    const inviterEmail = req.user.email;

    if (!email) {
        return res.status(400).json({ message: 'Email của người được mời là bắt buộc.' });
    }

    let connection;
    try {
        const [inviteeUserRows] = await db.query(`SELECT user_id FROM users WHERE email = ?`, [email]);

        if (inviteeUserRows.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng với email này. Hãy yêu cầu họ đăng ký trước.' });
        }
        const inviteeUserId = inviteeUserRows[0].user_id;

        const [existingFundUserRows] = await db.query(
            `SELECT * FROM funds_members WHERE fund_id = ? AND user_id = ?`,
            [fundId, inviteeUserId]
        );

        if (existingFundUserRows.length > 0) {
            const existingStatus = existingFundUserRows[0].status;
            if (existingStatus === 'pending') {
                return res.status(409).json({ message: 'Người dùng này đã được mời và lời mời đang chờ xử lý.' });
            }
            if (existingStatus === 'accepted') {
                return res.status(409).json({ message: 'Người dùng này đã là thành viên của quỹ.' });
            }
            if (existingStatus === 'rejected' || existingFundUserRows[0].deleted_at !== null) {
                await db.query(
                    `UPDATE funds_members SET status = 'pending', deleted_at = NULL, created_at = CURRENT_TIMESTAMP WHERE fund_id = ? AND user_id = ?`,
                    [fundId, inviteeUserId]
                );
                const [fundRows] = await db.query(`SELECT name FROM funds WHERE fund_id = ?`, [fundId]);
                const fundName = fundRows[0] ? fundRows[0].name : 'một quỹ';

                await sendNotification(
        inviteeUserId,
        'Lời mời tham gia Quỹ',
        `Bạn đã được mời tham gia quỹ "${fundName}" bởi ${inviterEmail || 'một người dùng khác'}.`,
        { type: 'invitation', fundId: fundId, inviterId: inviterUserId } 
    );
            }
        }

        await db.query(
            `INSERT INTO funds_members (fund_id, user_id, role, status)
             VALUES (?, ?, ?, ?)`,
            [fundId, inviteeUserId, 'Member', 'pending']
        );

        const [fundRows] = await db.query(`SELECT name FROM funds WHERE fund_id = ?`, [fundId]);
        const fundName = fundRows[0] ? fundRows[0].name : 'một quỹ';

        await sendNotification(
        inviteeUserId,
        'Lời mời tham gia Quỹ Mới',
        `Bạn đã được mời lại tham gia quỹ "${fundName}" bởi ${inviterEmail || 'một người dùng khác'}.`,
        { type: 'invitation', fundId: fundId, inviterId: inviterUserId } 
    );


        res.status(200).json({ message: 'Lời mời đã được gửi thành công!' });

    } catch (error) {
        console.error('Lỗi khi mời thành viên:', error);
        res.status(500).json({ message: 'Không thể gửi lời mời.', error: error.message });
    }
};

exports.acceptInvitation = async (req, res) => {
    const fundId = req.params.fundId;
    const userId = req.user.userId;

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [fundUserRows] = await connection.query(
            `SELECT * FROM funds_members WHERE fund_id = ? AND user_id = ? AND status = 'pending'`,
            [fundId, userId]
        );

        if (fundUserRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Không tìm thấy lời mời hoặc lời mời đã được chấp nhận/từ chối.' });
        }

        await connection.query(
            `UPDATE funds_members SET status = 'accepted' WHERE fund_id = ? AND user_id = ?`,
            [fundId, userId]
        );

        const [fundRows] = await connection.query(`SELECT name, created_by_user_id FROM funds WHERE fund_id = ?`, [fundId]);
        const fundName = fundRows[0] ? fundRows[0].name : 'một quỹ';
        const fundCreatorId = fundRows[0] ? fundRows[0].created_by_user_id : null;

        const [accepterUserRows] = await connection.query(`SELECT email FROM users WHERE user_id = ?`, [userId]);
        const accepterEmail = accepterUserRows[0] ? accepterUserRows[0].email : 'một người dùng';

        if (fundCreatorId) {
             await sendNotification(
                fundCreatorId,
                'Lời mời đã được chấp nhận',
                `${accepterEmail} đã chấp nhận lời mời tham gia quỹ "${fundName}" của bạn.`,
                { type: 'invitation_accepted', fundId: fundId, accepterId: userId }
            );
        }

        await connection.commit();

        res.status(200).json({ message: 'Lời mời đã được chấp nhận thành công!' });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Lỗi khi chấp nhận lời mời:', error);
        res.status(500).json({ message: 'Không thể chấp nhận lời mời.', error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

exports.rejectInvitation = async (req, res) => {
    const fundId = req.params.fundId;
    const userId = req.user.userId;

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [fundUserRows] = await connection.query(
            `SELECT * FROM funds_members WHERE fund_id = ? AND user_id = ? AND status = 'pending'`,
            [fundId, userId]
        );

        if (fundUserRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Không tìm thấy lời mời hoặc lời mời đã được chấp nhận/từ chối.' });
        }

        await connection.query(
            `UPDATE funds_members SET status = 'rejected', deleted_at = CURRENT_TIMESTAMP WHERE fund_id = ? AND user_id = ?`,
            [fundId, userId]
        );

        const [fundRows] = await connection.query(`SELECT name, created_by_user_id FROM funds WHERE fund_id = ?`, [fundId]);
        const fundName = fundRows[0] ? fundRows[0].name : 'một quỹ';
        const fundCreatorId = fundRows[0] ? fundRows[0].created_by_user_id : null;

        const [rejecterUserRows] = await connection.query(`SELECT email FROM users WHERE user_id = ?`, [userId]);
        const rejecterEmail = rejecterUserRows[0] ? rejecterUserRows[0].email : 'một người dùng';

        if (fundCreatorId) {
             await sendNotification(
                fundCreatorId,
                'Lời mời đã bị từ chối',
                `${rejecterEmail} đã từ chối lời mời tham gia quỹ "${fundName}" của bạn.`,
                { type: 'invitation_rejected', fundId: fundId, rejecterId: userId }
            );
        }

        await connection.commit();

        res.status(200).json({ message: 'Lời mời đã được từ chối thành công!' });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Lỗi khi từ chối lời mời:', error);
        res.status(500).json({ message: 'Không thể từ chối lời mời.', error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

exports.getPendingInvitations = async (req, res) => {
    const userId = req.user.userId;

    try {
        const [pendingInvitations] = await db.query(
            `SELECT fm.fund_id, f.name AS fund_name, f.description AS fund_description,
                    u.email AS inviter_email, u.username AS inviter_username
             FROM funds_members fm
             JOIN funds f ON fm.fund_id = f.fund_id
             JOIN users u ON f.created_by_user_id = u.user_id -- Lấy thông tin người tạo quỹ (người gửi lời mời ban đầu)
             WHERE fm.user_id = ? AND fm.status = 'pending'`,
            [userId]
        );
        res.status(200).json({ invitations: pendingInvitations });
    } catch (error) {
        console.error('Lỗi khi lấy danh sách lời mời đang chờ:', error);
        res.status(500).json({ message: 'Không thể lấy danh sách lời mời đang chờ.', error: error.message });
    }
};