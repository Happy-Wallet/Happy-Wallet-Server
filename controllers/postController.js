const db = require("../config/db");
const cloudinary = require("../utils/cloudinary"); 
const multer = require('multer'); 

const upload = multer({ storage: multer.memoryStorage() });

exports.createPost = async (req, res) => {
    const caption = req.body ? req.body.caption : undefined;
    let activity_ids_raw = req.body ? req.body.activity_ids : undefined;


    // Kiểm tra và xử lý lỗi nếu caption là undefined
    if (caption === undefined) {
        return res.status(400).json({ message: "Caption is missing in the request." });
    }

    let activity_ids = [];
    if (activity_ids_raw) {
        try {
            activity_ids = JSON.parse(activity_ids_raw); // Parse chuỗi JSON thành mảng
            if (!Array.isArray(activity_ids)) { // Đảm bảo nó là một mảng
                throw new Error("Parsed activity_ids is not an array.");
            }
        } catch (e) {
            console.error("Error parsing activity_ids:", e);
            return res.status(400).json({ message: "Invalid activity_ids format." });
        }
    }

    const userId = req.user.userId; // Lấy userId từ token đã xác thực
    let imageUrl = null;

    try {
        if (req.file) { // Kiểm tra xem có file ảnh nào được gửi lên không
            const result = await cloudinary.uploader.upload(
                `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
                { folder: "posts" }
            );
            imageUrl = result.secure_url;
        }

        // Logic để chèn bài đăng vào DB
        const [insertPostResult] = await db.query(
            "INSERT INTO posts (user_id, image_url, caption) VALUES (?, ?, ?)",
            [userId, imageUrl, caption]
        );

        const insertedPostId = insertPostResult.insertId; // Lấy ID của bài đăng vừa tạo

        if (activity_ids.length > 0) {
            const values = activity_ids.map(id => [insertedPostId, id]);
            console.log(`Associated post ${insertedPostId} with activities:`, activity_ids);
        }

        const [newPostRows] = await db.query(
            "SELECT p.*, u.username, u.avatar_url FROM posts p JOIN users u ON p.user_id = u.user_id WHERE p.post_id = ?",
            [insertedPostId]
        );

        res.status(201).json({
            message: "Post created successfully",
            post: newPostRows[0],
        });

    } catch (err) {
        console.error("Error creating post:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.getPosts = async (req, res) => {
  try {
    const [posts] = await db.query(`
      SELECT p.*, u.username, u.avatar_url
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.deleted_at IS NULL
      ORDER BY p.created_at DESC
    `);
    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: "Server error fetching posts." });
  }
};

exports.getPosts = async (req, res) => {
    try {
        const [posts] = await db.query(`
            SELECT p.*, u.username, u.avatar_url
            FROM posts p
            JOIN users u ON p.user_id = u.user_id
            WHERE p.deleted_at IS NULL
            ORDER BY p.created_at DESC
        `);
        res.json(posts);
    } catch (err) {
        console.error("Error fetching posts:", err);
        res.status(500).json({ error: "Server error fetching posts." });
    }
};

exports.getPostById = async (req, res) => { 
    const { id } = req.params;
    try {
        const [postRows] = await db.query(`
            SELECT p.post_id, p.user_id, p.image_url, p.caption, p.created_at, p.updated_at,
                   u.username, u.avatar_url, u.email as user_email
            FROM posts p
            JOIN users u ON p.user_id = u.user_id
            WHERE p.post_id = ? AND p.deleted_at IS NULL
        `, [id]);

        if (postRows.length === 0) {
            return res.status(404).json({ message: "Post not found" });
        }

        const post = postRows[0];
        // Lấy activities
        const [activities] = await db.query(`
            SELECT fa.*, u.username, u.avatar_url
            FROM fund_activities fa
            JOIN users u ON fa.user_id = u.user_id
            WHERE fa.user_id = ?
            ORDER BY fa.created_at DESC
            LIMIT 2
        `, [post.user_id]);

        // Lấy comments
        const [comments] = await db.query(`
            SELECT c.comment_id, c.post_id, c.user_id, c.comment_text, c.created_at,
                   u.username, u.avatar_url
            FROM comments c
            JOIN users u ON c.user_id = u.user_id
            WHERE c.post_id = ? AND c.deleted_at IS NULL
            ORDER BY c.created_at ASC
        `, [id]);

        const formattedPost = {
            postId: post.post_id,
            userId: post.user_id,
            imageUrl: post.image_url,
            caption: post.caption,
            createdAt: post.created_at,
            updatedAt: post.updated_at,
            user: {
                userId: post.user_id,
                email: post.user_email,
                username: post.username,
                avatarUrl: post.avatar_url
            },
            activities: activities.map(act => ({
                activityId: act.activity_id,
                fundId: act.fund_id,
                userId: act.user_id,
                transactionId: act.transaction_id,
                fundTransactionId: act.fund_transaction_id,
                activityType: act.activity_type,
                amount: parseFloat(act.amount),
                description: act.description,
                createdAt: act.created_at,
                fundName: act.fund_name,
                user: {
                    userId: act.user_id,
                    username: act.username,
                    avatarUrl: act.avatar_url
                }
            })),
            comments: comments.map(comm => ({
                commentId: comm.comment_id,
                postId: comm.post_id,
                userId: comm.user_id,
                commentText: comm.comment_text,
                createdAt: comm.created_at,
                user: {
                    userId: comm.user_id,
                    username: comm.username,
                    avatarUrl: comm.avatar_url
                }
            }))
        };

        res.json(formattedPost);
    } catch (err) {
        console.error("Error fetching post by ID with details:", err);
        res.status(500).json({ error: "Server error fetching post details." });
    }
};


exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const { caption, imageUrl } = req.body;
  const userId = req.user.userId;

  try {
    const [existingPost] = await db.query("SELECT * FROM posts WHERE post_id = ? AND deleted_at IS NULL", [id]);
    if (existingPost.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (existingPost[0].user_id !== userId) {
      return res.status(403).json({ message: "You are not authorized to update this post" });
    }

    await db.query(
      "UPDATE posts SET caption = ?, image_url = ? WHERE post_id = ?",
      [caption, imageUrl, id]
    );
    res.json({ message: "Post updated successfully" });
  } catch (err) {
    console.error("Error updating post:", err);
    res.status(500).json({ error: "Server error updating post." });
  }
};

exports.deletePost = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const [existingPost] = await db.query("SELECT * FROM posts WHERE post_id = ? AND deleted_at IS NULL", [id]);
    if (existingPost.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (existingPost[0].user_id !== userId) {
      return res.status(403).json({ message: "You are not authorized to delete this post" });
    }

    await db.query("UPDATE posts SET deleted_at = CURRENT_TIMESTAMP() WHERE post_id = ?", [id]);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err);
    res.status(500).json({ error: "Server error deleting post." });
  }
};

exports.createPostNoImage = async (req, res) => {

    const { caption } = req.body;
    let activity_ids = [];

    if (req.body.activity_ids) {
        try {
            activity_ids = req.body.activity_ids;
            if (typeof activity_ids === 'string') {
                activity_ids = JSON.parse(activity_ids);
            }
            if (!Array.isArray(activity_ids)) {
                throw new Error("Parsed activity_ids is not an array.");
            }
        } catch (e) {
            console.error("Error parsing activity_ids for no-image post:", e);
            return res.status(400).json({ message: "Invalid activity_ids format." });
        }
    }

    // Kiểm tra và xử lý lỗi nếu caption là undefined
    if (caption === undefined) {
        return res.status(400).json({ message: "Caption is missing in the request." });
    }

    const userId = req.user.userId; // Lấy userId từ token đã xác thực

    try {
        const [insertPostResult] = await db.query(
            "INSERT INTO posts (user_id, caption) VALUES (?, ?)", // Không có image_url
            [userId, caption]
        );
        const insertedPostId = insertPostResult.insertId;

        if (activity_ids.length > 0) {
            const values = activity_ids.map(id => [insertedPostId, id]);
            console.log(`Associated post ${insertedPostId} with activities (no image):`, activity_ids);
        }

        const [newPostRows] = await db.query(
            "SELECT p.*, u.username, u.avatar_url FROM posts p JOIN users u ON p.user_id = u.user_id WHERE p.post_id = ?",
            [insertedPostId]
        );
        res.status(201).json({
            message: "Post created successfully without image",
            post: newPostRows[0],
        });
    } catch (err) {
        console.error("Error creating post without image:", err);
        res.status(500).json({ error: err.message });
    }
};