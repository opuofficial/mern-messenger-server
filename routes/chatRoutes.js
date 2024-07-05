const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");
const { getConversations } = require("../controllers/chatController");

router.get("/", verifyToken, getConversations);

module.exports = router;
