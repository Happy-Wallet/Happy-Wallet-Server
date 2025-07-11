const express = require("express");
const router = express.Router();
const settingController = require("../controllers/settingController");
const authMiddleware = require("../middleware/authMiddleware");

router.put("/edit-profile", authMiddleware, settingController.uploadMiddleware, settingController.editProfile);
router.get("/profile", authMiddleware, settingController.getProfile);
router.put("/change-password", authMiddleware, settingController.changePassword);
module.exports = router;
