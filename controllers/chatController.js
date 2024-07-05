// chatController.js
const Conversation = require("../models/conversationModel");

const getConversations = async (req, res) => {
  const userId = req.user.userId;

  try {
    const conversations = await Conversation.find({
      users: userId,
    }).populate("users", "username isActive sId");

    console.log(conversations);

    res.status(200).json(conversations);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getConversations,
};
