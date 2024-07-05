const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const { getMessages } = require("../controllers/conversationController");

router.get("/:otherUserId", verifyToken, getMessages);

module.exports = router;
