const express = require("express");
const router = express.Router();
const fundController = require("../controllers/fundController");
const authMiddleware = require("../middleware/authMiddleware"); 

router.get("/", authMiddleware, fundController.getAllFunds);
router.post("/", authMiddleware, fundController.createFund);
router.get("/:fundId", authMiddleware, fundController.getFundDetails);
router.put("/:fundId", authMiddleware, fundController.updateFund); 

module.exports = router;