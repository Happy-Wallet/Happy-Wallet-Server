const express = require("express");
const router = express.Router();
const fundController = require("../controllers/fundController");
const authMiddleware = require("../middleware/authMiddleware"); 

router.get("/", authMiddleware, fundController.getAllFunds);
router.post("/", authMiddleware, fundController.createFund);
router.get("/:fundId", authMiddleware, fundController.getFundDetails);
router.put("/:fundId", authMiddleware, fundController.updateFund); 
router.delete("/:fundId/members/:memberId", authMiddleware, fundController.removeMember);
router.put("/:fundId/members/:memberId/role", authMiddleware, fundController.updateMemberRole);

module.exports = router;