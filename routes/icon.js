const express = require("express");
const router = express.Router();
const iconController = require("../controllers/iconController");

router.get("/", iconController.getAllIcons);
router.post("/", iconController.createIcon);
router.put("/:id", iconController.updateIcon);
router.delete("/:id", iconController.deleteIcon);

module.exports = router;
