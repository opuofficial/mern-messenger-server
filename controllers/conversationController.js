// messageController.js
const Message = require("../models/messageModel");
const Conversation = require("../models/conversationModel");

const getMessages = async (req, res) => {
  const currentUser = req.user.userId;
  const otherUserId = req.params.otherUserId;

  try {
    // Find the conversation between currentUser and otherUserId
    const conversation = await Conversation.findOne({
      users: { $all: [currentUser, otherUserId] },
    });

    if (!conversation) {
      return res.json([]);
    }

    // Retrieve all messages for the conversation and populate sender with all fields
    const messages = await Message.find({
      conversationId: conversation._id,
    }).populate({
      path: "sender",
      select: "-password", // Exclude sensitive fields if needed
    });

    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getMessages,
};
