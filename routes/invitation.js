// routes/invitation.js
const express = require("express");
const router = express.Router();
const invitationController = require("../controllers/invitationController");
const authMiddleware = require("../middleware/authMiddleware"); 
const authorizeFundAdmin = require("../middleware/authMiddleware").authorizeFundAdmin; 

router.post("/:fundId/invite", authMiddleware, authorizeFundAdmin, invitationController.inviteMember);
router.put("/:fundId/accept", authMiddleware, invitationController.acceptInvitation);
router.put("/:fundId/reject", authMiddleware, invitationController.rejectInvitation);
router.get("/pending", authMiddleware, invitationController.getPendingInvitations);

module.exports = router;