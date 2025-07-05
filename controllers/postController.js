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
            // TODO: Bạn cần chèn các hoạt động vào bảng post_activities hoặc một bảng liên kết khác
            // Hiện tại code này chỉ log mà chưa insert vào DB
            console.log(`Associated post ${insertedPostId} with activities:`, activity_ids);
        }

        const [newPostRows] = await db.query(
            "SELECT p.*, u.username, u.avatar_url, u.email, u.user_id as user_actual_id FROM posts p JOIN users u ON p.user_id = u.user_id WHERE p.post_id = ?",
            [insertedPostId]
        );

        // Đảm bảo trả về cấu trúc user lồng vào cho createPost
        const createdPost = newPostRows[0];
        res.status(201).json({
            message: "Post created successfully",
            post: {
                postId: createdPost.post_id,
                userId: createdPost.user_id,
                imageUrl: createdPost.image_url,
                caption: createdPost.caption,
                createdAt: createdPost.created_at,
                updatedAt: createdPost.updated_at,
                deletedAt: createdPost.deleted_at,
                user: {
                    userId: createdPost.user_actual_id, // Sử dụng user_actual_id hoặc u.user_id
                    username: createdPost.username,
                    avatarUrl: createdPost.avatar_url,
                    email: createdPost.email
                }
            },
        });

    } catch (err) {
        console.error("Error creating post:", err);
        res.status(500).json({ error: err.message });
    }
};

// Cập nhật exports.getPosts để trả về user object nhất quán
exports.getPosts = async (req, res) => {
  try {
    const [posts] = await db.query(`
      SELECT p.post_id, p.user_id, p.image_url, p.caption, p.created_at, p.updated_at, p.deleted_at,
             u.user_id AS user_id_data, u.username AS user_username_data, u.avatar_url AS user_avatar_url_data, u.email AS user_email_data
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.deleted_at IS NULL
      ORDER BY p.created_at DESC
    `);

    const formattedPosts = posts.map(post => {
        // Khởi tạo rỗng, getPosts không fetch chi tiết activities/comments
        const activities = [];
        const comments = [];

        return {
            postId: post.post_id,
            userId: post.user_id, // Đây là user_id của post, không phải từ user object
            imageUrl: post.image_url,
            caption: post.caption,
            createdAt: post.created_at,
            updatedAt: post.updated_at,
            deletedAt: post.deleted_at,
            user: { // Tạo đối tượng user lồng vào với tên trường chuẩn
                userId: post.user_id_data,
                username: post.user_username_data,
                avatarUrl: post.user_avatar_url_data,
                email: post.user_email_data
            },
            activities: activities,
            comments: comments
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
             u.user_id AS user_id_data, u.username AS user_username_data, u.avatar_url AS user_avatar_url_data, u.email AS user_email_data
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.post_id = ? AND p.deleted_at IS NULL
    `, [id]);

    if (postRows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const post = postRows[0];

    // TODO: Hiện tại bạn đang lấy activities theo user_id của người đăng bài.
    // Nếu bạn muốn các hoạt động liên quan trực tiếp đến post, bạn cần một bảng post_activities.
    const [activities] = await db.query(`
        SELECT fa.activity_id, fa.fund_id, fa.user_id, fa.transaction_id, fa.fund_transaction_id, fa.type as activity_type, fa.amount, fa.description, fa.created_at,
               f.name as fund_name,
               u.user_id as user_id_data, u.username as user_username_data, u.avatar_url as user_avatar_url_data
        FROM fund_activities fa
        LEFT JOIN funds f ON fa.fund_id = f.fund_id
        JOIN users u ON fa.user_id = u.user_id
        WHERE fa.user_id = ?
        ORDER BY fa.created_at DESC
        LIMIT 5
    `, [post.user_id]);


    const [comments] = await db.query(`
      SELECT c.comment_id, c.post_id, c.user_id, c.comment_text, c.created_at,
             u.user_id as user_id_data, u.username as user_username_data, u.avatar_url as user_avatar_url_data
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
      user: { // Tạo đối tượng user lồng vào với tên trường chuẩn
        userId: post.user_id_data,
        email: post.user_email_data,
        username: post.user_username_data,
        avatarUrl: post.user_avatar_url_data
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
        user: { // User của activity cũng cần được chuẩn hóa
            userId: act.user_id_data,
            username: act.user_username_data,
            avatarUrl: act.user_avatar_url_data
        }
      })),
      comments: comments.map(comm => ({
        commentId: comm.comment_id,
        postId: comm.post_id,
        userId: comm.user_id,
        commentText: comm.comment_text,
        createdAt: comm.created_at,
        user: { // User của comment cũng cần được chuẩn hóa
            userId: comm.user_id_data,
            username: comm.user_username_data,
            avatarUrl: comm.user_avatar_url_data
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
      "UPDATE posts SET caption = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP() WHERE post_id = ?",
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

    if (caption === undefined) {
        return res.status(400).json({ message: "Caption is missing in the request." });
    }

    const userId = req.user.userId;

    try {
        const [insertPostResult] = await db.query(
            "INSERT INTO posts (user_id, caption) VALUES (?, ?)", // Không có image_url
            [userId, caption]
        );
        const insertedPostId = insertPostResult.insertId;

        if (activity_ids.length > 0) {
            const values = activity_ids.map(id => [insertedPostId, id]);
            // TODO: Bạn cần chèn các hoạt động vào bảng post_activities hoặc một bảng liên kết khác
            // Hiện tại code này chỉ log mà chưa insert vào DB
            console.log(`Associated post ${insertedPostId} with activities (no image):`, activity_ids);
        }

        const [newPostRows] = await db.query(
            "SELECT p.*, u.username, u.avatar_url, u.email, u.user_id as user_actual_id FROM posts p JOIN users u ON p.user_id = u.user_id WHERE p.post_id = ?",
            [insertedPostId]
        );

        // Đảm bảo trả về cấu trúc user lồng vào cho createPostNoImage
        const createdPost = newPostRows[0];
        res.status(201).json({
            message: "Post created successfully without image",
            post: {
                postId: createdPost.post_id,
                userId: createdPost.user_id,
                imageUrl: createdPost.image_url, // Sẽ là null
                caption: createdPost.caption,
                createdAt: createdPost.created_at,
                updatedAt: createdPost.updated_at,
                deletedAt: createdPost.deleted_at,
                user: {
                    userId: createdPost.user_actual_id,
                    username: createdPost.username,
                    avatarUrl: createdPost.avatar_url,
                    email: createdPost.email
                }
            },
        });
    } catch (err) {
        console.error("Error creating post without image:", err);
        res.status(500).json({ error: err.message });
    }
};