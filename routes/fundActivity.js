const express = require("express");
const router = express.Router();
const fundActivityController = require("../controllers/fundActivityController");
const authenticateToken = require("../middleware/authMiddleware");

router.post("/", authenticateToken, fundActivityController.addFundActivity);
router.get("/fund/:fundId", authenticateToken, fundActivityController.getFundActivitiesByFund);
router.get("/user", authenticateToken, fundActivityController.getUserFundActivities);

module.exports = router;