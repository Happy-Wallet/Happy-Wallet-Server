const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const sendEmail = require("../utils/sendEmail");
require('dotenv').config(); 

const JWT_SECRET = process.env.JWT_SECRET;

exports.register = async (req, res) => {
  const { email, username, password, date_of_birth } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length > 0)
      return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      "INSERT INTO users (email, username, hashed_password, date_of_birth) VALUES (?, ?, ?, ?)",
      [email, username, hashedPassword, date_of_birth]
    );

    const insertedId = result[0].insertId;
    const [newUserRows] = await db.query(
      "SELECT * FROM users WHERE user_id = ?",
      [insertedId]
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        user_id: insertedId,
        email: newUserRows[0].email,
        username: newUserRows[0].username,
        date_of_birth: newUserRows[0].date_of_birth,
        created_at: newUserRows[0].created_at,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0)
      return res.status(400).json({ message: "User not found" });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.hashed_password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user.user_id, email: user.email }, JWT_SECRET, {
      expiresIn: "1d",
    });
    res.json({
      token,
      userId: user.user_id,
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const otpStore = require("../utils/otpStore");

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ message: "Email not found" });

    const otp = Math.floor(1000 + Math.random() * 9000).toString(); 
    const expiresAt = Date.now() + 10 * 60 * 1000; 

    otpStore.set(email, { otp, expiresAt, isUsed: false });

    const htmlContent = `
      <h3>Khôi phục mật khẩu</h3>
      <p>Mã OTP của bạn là:</p>
      <h2 style="color: #28a745;">${otp}</h2>
      <p>Mã có hiệu lực trong 10 phút.</p>
    `;

    await sendEmail(
      email,
      "Mã OTP khôi phục mật khẩu - Happy Wallet",
      htmlContent
    );
    res.json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body; 

  try {
    const storedOtpData = otpStore.get(email);

    if (!storedOtpData || storedOtpData.otp !== otp || storedOtpData.isUsed || Date.now() > storedOtpData.expiresAt) {
      return res.status(400).json({ error: "Invalid or expired OTP." });
    }
    otpStore.set(email, { ...storedOtpData, isUsed: true }); 

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query("UPDATE users SET hashed_password = ? WHERE email = ?", [
      hashedPassword, 
      email, 
    ]);
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset password error:", err); 
    res.status(500).json({ error: "Server error during password reset." }); 
  }
};