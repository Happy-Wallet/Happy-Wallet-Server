const db = require('../config/db'); 

exports.getNotifications = async (req, res) => {
    const userId = req.user.userId;
    console.log(`DEBUG: API GET /notifications called for userId: ${userId}`);

    try {
        const [notifications] = await db.query(
            `SELECT
                notification_id AS id,
                user_id,
                title,
                description,
                type,
                resource_id AS fund_id,
                is_read, /* KHÔNG CẦN ÉP KIỂU TRỰC TIẾP Ở ĐÂY NỮA */
                created_at,
                updated_at
            FROM notifications
            WHERE user_id = ?
            ORDER BY created_at DESC`,
            [userId]
        );

        // THÊM LOGIC CHUYỂN ĐỔI is_read SANG BOOLEAN TẠI ĐÂY
        const formattedNotifications = notifications.map(notif => ({
            ...notif, // Copy tất cả các thuộc tính hiện có
            is_read: notif.is_read === 1 // Chuyển đổi 0/1 thành false/true
        }));

        console.log(`DEBUG: Found ${formattedNotifications.length} notifications for userId ${userId}`);
        console.log('DEBUG: Formatted Notifications data:', formattedNotifications); // Log dữ liệu đã format

        res.status(200).json(formattedNotifications); // Gửi dữ liệu đã format

    } catch (error) {
        console.error('Lỗi khi lấy thông báo:', error);
        res.status(500).json({ message: 'Không thể lấy thông báo.', error: error.message });
    }
};

exports.markNotificationAsRead = async (req, res) => {
    const notificationId = req.params.notificationId;
    const userId = req.user.userId; 

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [notificationRows] = await connection.query(
            `SELECT * FROM notifications WHERE notification_id = ? AND user_id = ?`,
            [notificationId, userId]
        );

        if (notificationRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Không tìm thấy thông báo hoặc bạn không có quyền.' });
        }

        await connection.query(
            `UPDATE notifications SET is_read = TRUE, updated_at = CURRENT_TIMESTAMP WHERE notification_id = ?`,
            [notificationId]
        );

        await connection.commit();
        res.status(200).json({ message: 'Thông báo đã được đánh dấu là đã đọc.' });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Lỗi khi đánh dấu thông báo đã đọc:', error);
        res.status(500).json({ message: 'Không thể đánh dấu thông báo đã đọc.', error: error.message });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};