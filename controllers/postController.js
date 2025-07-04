const db = require("../config/db");
const cloudinary = require("../utils/cloudinary"); 
const multer = require('multer'); 

const upload = multer({ storage: multer.memoryStorage() });

exports.createPost = async (req, res) => {
    const caption = req.body ? req.body.caption : undefined;
    let activity_ids_raw = req.body ? req.body.activity_ids : undefined;


    if (caption === undefined) {
        return res.status(400).json({ message: "Caption is missing in the request." });
    }

    let activity_ids = [];
    if (activity_ids_raw) {
        try {
            activity_ids = JSON.parse(activity_ids_raw); 
            if (!Array.isArray(activity_ids)) { 
                throw new Error("Parsed activity_ids is not an array.");
            }
        } catch (e) {
            console.error("Error parsing activity_ids:", e);
            return res.status(400).json({ message: "Invalid activity_ids format." });
        }
    }

    const userId = req.user.userId;
    let imageUrl = null;

    try {
        if (req.file) { 
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
      SELECT p.post_id, p.user_id, p.image_url, p.caption, p.created_at, p.updated_at, p.deleted_at,
             u.user_id as user_id_alias, u.username as user_username_alias, u.avatar_url as user_avatar_url_alias, u.email as user_email_alias
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.deleted_at IS NULL
      ORDER BY p.created_at DESC
    `);

    const formattedPosts = posts.map(post => {
        const activities = []; 
        const comments = [];  

        return {
            postId: post.post_id,
            userId: post.user_id,
            imageUrl: post.image_url,
            caption: post.caption,
            createdAt: post.created_at,
            updatedAt: post.updated_at,
            deletedAt: post.deleted_at,
            user: { // TẠO ĐỐI TƯỢNG USER LỒNG VÀO ĐÂY VỚI CÁC TRƯỜNG ĐÚNG
                userId: post.user_id_alias,
                username: post.user_username_alias,
                avatarUrl: post.user_avatar_url_alias,
                email: post.user_email_alias
            },
            activities: activities, // Gán mảng activities
            comments: comments      // Gán mảng comments
        };
    });

    res.json(formattedPosts);
  } catch (err) {
    console.error("Error fetching posts:", err);
    res.status(500).json({ error: "Server error fetching posts." });
  }
};

exports.getPostById = async (req, res) => {
  const { id } = req.params;
  try {
    const [postRows] = await db.query(`
      SELECT p.post_id, p.user_id, p.image_url, p.caption, p.created_at, p.updated_at, p.deleted_at,
             u.user_id as user_id_alias, u.username as user_username_alias, u.avatar_url as user_avatar_url_alias, u.email as user_email_alias
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.post_id = ? AND p.deleted_at IS NULL
    `, [id]);

    if (postRows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const post = postRows[0];

    const [activities] = await db.query(`
        SELECT fa.activity_id, fa.fund_id, fa.user_id, fa.transaction_id, fa.fund_transaction_id, fa.type as activity_type, fa.amount, fa.description, fa.created_at,
               f.name as fund_name, -- Join bảng funds để lấy tên quỹ
               u.user_id as user_id_alias, u.username as user_username_alias, u.avatar_url as user_avatar_url_alias
        FROM fund_activities fa
        LEFT JOIN funds f ON fa.fund_id = f.fund_id -- Join để lấy tên quỹ
        JOIN users u ON fa.user_id = u.user_id
        WHERE fa.user_id = ? -- Hoặc liên kết với post_id nếu có bảng post_activities
        ORDER BY fa.created_at DESC
        LIMIT 5 -- Lấy nhiều hơn để test
    `, [post.user_id]);


    const [comments] = await db.query(`
      SELECT c.comment_id, c.post_id, c.user_id, c.comment_text, c.created_at,
             u.user_id as user_id_alias, u.username as user_username_alias, u.avatar_url as user_avatar_url_alias
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
      deletedAt: post.deleted_at,
      user: { 
        userId: post.user_id_alias,
        email: post.user_email_alias,
        username: post.user_username_alias,
        avatarUrl: post.user_avatar_url_alias
      },
      activities: activities.map(act => ({
        activityId: act.activity_id,
        fundId: act.fund_id,
        userId: act.user_id,
        transactionId: act.transaction_id,
        fundTransactionId: act.fund_transaction_id,
        activityType: act.activity_type,
        amount: act.amount ? parseFloat(act.amount) : null, 
        description: act.description,
        createdAt: act.created_at,
        fundName: act.fund_name,
        user: {
            userId: act.user_id_alias,
            username: act.user_username_alias,
            avatarUrl: act.user_avatar_url_alias
        }
      })),
      comments: comments.map(comm => ({
        commentId: comm.comment_id,
        postId: comm.post_id,
        userId: comm.user_id,
        commentText: comm.comment_text,
        createdAt: comm.created_at,
        user: {
            userId: comm.user_id_alias,
            username: comm.user_username_alias,
            avatarUrl: comm.user_avatar_url_alias
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