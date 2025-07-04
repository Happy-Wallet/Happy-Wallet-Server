const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const authenticateToken = require("../middleware/authMiddleware"); 

router.post("/", authenticateToken, postController.createPost);
router.get("/", authenticateToken, postController.getPosts);
router.get("/:id", authenticateToken, postController.getPostById);
router.put("/:id", authenticateToken, postController.updatePost);
router.delete("/:id", authenticateToken, postController.deletePost);

module.exports = router;