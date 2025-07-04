const express = require("express");
const router = express.Router();
const fundTransactionController = require("../controllers/fundTransactionController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/:fundId", authMiddleware, fundTransactionController.createFundTransaction);
router.get("/:fundId", authMiddleware, fundTransactionController.getFundTransactions);
router.put("/:fundId/transactions/:transactionId", authMiddleware, fundTransactionController.updateFundTransaction);
router.delete("/:fundId/transactions/:transactionId", authMiddleware, fundTransactionController.deleteFundTransaction);

router.get("/:fundId/contributions", authMiddleware, fundTransactionController.getMemberContributions);

router.get("/:fundId", (req, res, next) => {
    console.log("Đã nhận GET /fund_transactions/:fundId với id =", req.params.fundId);
    next();
  }, authMiddleware, fundTransactionController.getFundTransactions);
  


module.exports = router;