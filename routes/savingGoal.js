const express = require("express");
const router = express.Router();
const savingGoalController = require("../controllers/savingGoalController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/", authMiddleware, savingGoalController.getSavingGoals);
router.post("/", authMiddleware, savingGoalController.createSavingGoal);
router.put("/:id", authMiddleware, savingGoalController.updateSavingGoal);
router.delete("/:id", authMiddleware, savingGoalController.deleteSavingGoal);
router.post(
  "/:id/add",
  authMiddleware,
  savingGoalController.addMoneyToSavingGoal
);

module.exports = router;
