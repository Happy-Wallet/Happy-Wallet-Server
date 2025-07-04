// routes/post.js
const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const authenticateToken = require("../middleware/authMiddleware"); // Đường dẫn đúng
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Cấu hình Multer

// Định nghĩa tất cả các route của bạn một cách rõ ràng và duy nhất.
// Router cho POST /posts (tạo bài đăng CÓ HÌNH ẢNH và các hoạt động)
// Multer middleware phải ĐƯỢC BAO GỒM ở đây để xử lý multipart/form-data.
router.post("/",
    authenticateToken,
    upload.single('image'), // <-- Dòng này quan trọng để req.body và req.file có dữ liệu
    postController.createPost
);

// Router cho POST /posts/no-image (tạo bài đăng KHÔNG CÓ HÌNH ẢNH)
// Endpoint này sẽ nhận JSON body, KHÔNG cần Multer ở đây.
router.post("/no-image", authenticateToken, postController.createPostNoImage);

// Các router GET, PUT, DELETE cho POSTS
router.get("/", authenticateToken, postController.getPosts);
router.get("/:id", authenticateToken, postController.getPostById);
router.put("/:id", authenticateToken, postController.updatePost);
router.delete("/:id", authenticateToken, postController.deletePost);

// Chỉ export router MỘT LẦN DUY NHẤT ở cuối file
module.exports = router;