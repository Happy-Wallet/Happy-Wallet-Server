const express = require("express");
const router = express.Router();
const fundController = require("../controllers/fundController");
const authMiddleware = require("../middleware/authMiddleware"); 

router.post("/", authMiddleware, fundController.createFund);
router.get("/:fundId", authMiddleware, fundController.getFundDetails);

module.exports = router;