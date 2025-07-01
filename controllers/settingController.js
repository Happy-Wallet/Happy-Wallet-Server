const db = require("../config/db");
const cloudinary = require("../utils/cloudinary");
const multer = require("multer");
const streamifier = require("streamifier");

const storage = multer.memoryStorage();
const upload = multer({ storage });

exports.uploadMiddleware = upload.single("avatar");

exports.editProfile = async (req, res) => {
  const userId = req.user.userId;
  const { username, date_of_birth } = req.body;
  let avatarUrl = null;

  try {
    const updateUserAndRespond = async () => {
      const [rows] = await db.query("SELECT username, date_of_birth, avatar_url FROM users WHERE user_id = ?", [userId]);
      const user = rows[0];

      return res.json({
        message: "Profile updated successfully",
        username: user.username,
        date_of_birth: user.date_of_birth,
        avatar_url: user.avatar_url,
      });
    };

    if (req.file) {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "avatars" },
        async (error, result) => {
          if (error) return res.status(500).json({ error: error.message });

          avatarUrl = result.secure_url;

          await db.query(
            "UPDATE users SET username = ?, date_of_birth = ?, avatar_url = ? WHERE user_id = ?",
            [username, date_of_birth, avatarUrl, userId]
          );

          return updateUserAndRespond();
        }
      );

      require("streamifier").createReadStream(req.file.buffer).pipe(stream);
    } else {
      await db.query(
        "UPDATE users SET username = ?, date_of_birth = ? WHERE user_id = ?",
        [username, date_of_birth, userId]
      );

      return updateUserAndRespond();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  const userId = req.user.userId;

  try {
    const [rows] = await db.query(
      "SELECT email, username, date_of_birth, avatar_url FROM users WHERE user_id = ?",
      [userId]
    );

    if (rows.length === 0)
      return res.status(404).json({ message: "User not found" });

    const user = rows[0];

    res.json({
      email: user.email,
      username: user.username,
      date_of_birth: user.date_of_birth,
      avatar_url: user.avatar_url || null
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.changePassword = async (req, res) => {
  const userId = req.user.userId;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Please fill all" });
  }

  try {
    const [rows] = await db.query("SELECT hashed_password FROM users WHERE user_id = ?", [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User undefined." });
    }

    const user = rows[0];
    const hashedCurrentPassword = user.hashed_password;

    const isMatch = await bcrypt.compare(currentPassword, hashedCurrentPassword);

    if (!isMatch) {
      return res.status(401).json({ message: "Wrong current password." });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10); 

    await db.query("UPDATE users SET hashed_password = ? WHERE user_id = ?", [hashedNewPassword, userId]);

    res.json({ message: "Change password sucess." });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Server." });
  }
};