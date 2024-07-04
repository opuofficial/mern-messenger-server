const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema({
  text: {
    type: String,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
  },
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
