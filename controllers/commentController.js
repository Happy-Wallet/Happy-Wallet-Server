const db = require("../config/db");

exports.addComment = async (req, res) => {
  const { postId } = req.params;
  const { commentText } = req.body;
  const userId = req.user.userId;

  try {
    const [postRows] = await db.query("SELECT * FROM posts WHERE post_id = ? AND deleted_at IS NULL", [postId]);
    if (postRows.length === 0) {
      return res.status(404).json({ message: "Post not found" });
    }

    const [result] = await db.query(
      "INSERT INTO comments (post_id, user_id, comment_text) VALUES (?, ?, ?)",
      [postId, userId, commentText]
    );

    const [newCommentRows] = await db.query(
      "SELECT c.*, u.username, u.avatar_url FROM comments c JOIN users u ON c.user_id = u.user_id WHERE c.comment_id = ?",
      [result.insertId]
    );

    res.status(201).json({
      message: "Comment added successfully",
      comment: newCommentRows[0],
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({ error: "Server error adding comment." });
  }
};

exports.getCommentsByPost = async (req, res) => {
  const { postId } = req.params;

  try {
    const [comments] = await db.query(`
      SELECT c.*, u.username, u.avatar_url
      FROM comments c
      JOIN users u ON c.user_id = u.user_id
      WHERE c.post_id = ? AND c.deleted_at IS NULL
      ORDER BY c.created_at ASC
    `, [postId]);
    res.json(comments);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).json({ error: "Server error fetching comments." });
  }
};

exports.updateComment = async (req, res) => {
  const { commentId } = req.params;
  const { commentText } = req.body;
  const userId = req.user.userId;

  try {
    const [existingComment] = await db.query("SELECT * FROM comments WHERE comment_id = ? AND deleted_at IS NULL", [commentId]);
    if (existingComment.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (existingComment[0].user_id !== userId) {
      return res.status(403).json({ message: "You are not authorized to update this comment" });
    }

    await db.query("UPDATE comments SET comment_text = ? WHERE comment_id = ?", [commentText, commentId]);
    res.json({ message: "Comment updated successfully" });
  } catch (err) {
    console.error("Error updating comment:", err);
    res.status(500).json({ error: "Server error updating comment." });
  }
};

exports.deleteComment = async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user.userId;

  try {
    const [existingComment] = await db.query("SELECT * FROM comments WHERE comment_id = ? AND deleted_at IS NULL", [commentId]);
    if (existingComment.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (existingComment[0].user_id !== userId) {
      return res.status(403).json({ message: "You are not authorized to delete this comment" });
    }

    await db.query("UPDATE comments SET deleted_at = CURRENT_TIMESTAMP() WHERE comment_id = ?", [commentId]);
    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("Error deleting comment:", err);
    res.status(500).json({ error: "Server error deleting comment." });
  }
};