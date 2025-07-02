// authMiddleware.js
const jwt = require("jsonwebtoken");
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
const db = require('../config/db'); // Import kết nối DB

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Không có token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { userId: decoded.userId, email: decoded.email };
    next();
  } catch (err) {
    res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};

const authorizeFundAdmin = async (req, res, next) => {
  const fundId = req.params.fundId;
  const userId = req.user.userId;

  try {
    const [rows] = await db.query(
      `SELECT * FROM funds_members WHERE fund_id = ? AND user_id = ? AND status = 'accepted' AND role = 'Admin'`,
      [fundId, userId]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: 'Forbidden: Bạn không có quyền quản trị quỹ này.' });
    }
    next();
  } catch (error) {
    console.error('Lỗi ủy quyền admin quỹ:', error);
    res.status(500).json({ message: 'Lỗi server khi kiểm tra quyền.' });
  }
};

module.exports = authenticateToken;
module.exports.authorizeFundAdmin = authorizeFundAdmin;