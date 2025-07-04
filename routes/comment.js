const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const authenticateToken = require("../middleware/authMiddleware");

router.post("/:postId", authenticateToken, commentController.addComment);
router.get("/:postId", authenticateToken, commentController.getCommentsByPost);
router.put("/:commentId", authenticateToken, commentController.updateComment);
router.delete("/:commentId", authenticateToken, commentController.deleteComment);

module.exports = router;