const db = require("../config/db");
const cloudinary = require("../utils/cloudinary"); 

exports.createPost = async (req, res) => {
  const { caption } = req.body;
  const userId = req.user.userId;
  let imageUrl = null;

  try {
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.buffer.toString('base64'), {
        folder: "posts", 
        resource_type: "image",
      });
      imageUrl = result.secure_url; 
    }

    const [result] = await db.query(
      "INSERT INTO posts (user_id, image_url, caption) VALUES (?, ?, ?)",
      [userId, imageUrl, caption]
    );

    const [newPostRows] = await db.query(
      "SELECT p.*, u.username, u.avatar_url FROM posts p JOIN users u ON p.user_id = u.user_id WHERE p.post_id = ?",
      [result.insertId]
    );

    res.status(201).json({
      message: "Post created successfully",
      post: newPostRows[0],
    });
  } catch (err) {
    console.error("Error creating post:", err);
    if (err.message.includes('Only image files are allowed!')) {
        return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Server error during post creation." });
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
    const [post] = await db.query(`
      SELECT p.*, u.username, u.avatar_url
      FROM posts p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.post_id = ? AND p.deleted_at IS NULL
    `, [id]);

    if (post.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.json(post[0]);
  } catch (err) {
    console.error("Error fetching post by ID:", err);
    res.status(500).json({ error: "Server error fetching post." });
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