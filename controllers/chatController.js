// chatController.js
const Conversation = require("../models/conversationModel");

const getConversations = async (req, res) => {
  const userId = req.user.userId;

  try {
    const conversations = await Conversation.find({
      users: userId,
    }).populate("users", "username _id");

    // const filteredConversations = conversations.map((conversation) => {
    //   const otherUsers = conversation.users.filter(
    //     (user) => user._id.toString() !== userId
    //   );
    //   return {
    //     ...conversation._doc,
    //     users: otherUsers,
    //   };
    // });

    const filteredConversations = conversations
      .map((conversation) => {
        const otherUsers = conversation.users.filter(
          (user) => user._id.toString() !== userId
        );
        return {
          ...conversation._doc,
          users: otherUsers,
        };
      })
      .map((conversation) => {
        return {
          _id: conversation.users[0]._id,
          username: conversation.users[0].username,
        };
      });

    console.log(filteredConversations);

    res.status(200).json(filteredConversations);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getConversations,
};
