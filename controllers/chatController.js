// chatController.js
const Conversation = require("../models/conversationModel");

const getConversations = async (req, res) => {
  const userId = req.user.userId;

  try {
    const conversations = await Conversation.find({
      users: userId,
    }).populate("users", "username _id");

    const filterConversation = conversations.map((conversation) => {
      let x = conversation.users.filter((user) => user._id != userId);

      return x;
    });

    res.status(200).json(...filterConversation);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getConversations,
};
