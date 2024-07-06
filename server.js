require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const PORT = process.env.PORT || 3001;
const http = require("http");
const socketIO = require("socket.io");
const server = http.createServer(app);
const io = socketIO(server, { cors: { origin: "*" } });
const jwt = require("jsonwebtoken");
const User = require("./models/userModel");
const Conversation = require("./models/conversationModel");
const Message = require("./models/messageModel");

const connectDB = require("./config/db");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.use(morgan("tiny"));

connectDB();

app.use("/user", require("./routes/userRoutes"));
app.use("/chats", require("./routes/chatRoutes"));
app.use("/conversation", require("./routes/conversationRoutes"));

const authenticateUser = (token) => {
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    return decodedToken.userId;
  } catch (error) {
    console.log(error);
  }
};

const setUserOnline = async (userId, socketId) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive: true, sId: socketId },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  } catch (error) {
    console.error("Error setting user online:", error);
  }
};

const setUserOffline = async (userId, socketId) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isActive: false, sId: socketId },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  } catch (error) {
    console.error("Error setting user offline:", error);
  }
};

io.use((socket, next) => {
  // console.log("socket middleware");
  const token = socket.handshake.query.token;
  const userId = authenticateUser(token);
  // console.log("from socket middleware", userId);
  if (userId) {
    socket.userId = userId;
    next();
  }
});

io.on("connection", (socket) => {
  // console.log("a user connected", socket.userId);
  setUserOnline(socket.userId, socket.id);

  socket.on("new-message", async (payload) => {
    const { recieverUserId, message } = payload;
    const senderUserId = socket.userId;

    try {
      const receiver = await User.findById(recieverUserId);

      if (!receiver) {
        console.error("Receiver not found");
        return;
      }

      let conversation = await Conversation.findOne({
        users: { $all: [senderUserId, recieverUserId] },
      });

      if (!conversation) {
        conversation = new Conversation({
          users: [senderUserId, recieverUserId],
        });
        await conversation.save();
      }

      const newMessage = new Message({
        text: message,
        sender: { _id: senderUserId },
        conversationId: conversation._id,
      });

      await newMessage.save();

      socket.emit("new-message", newMessage);

      if (receiver.isActive) {
        socket.to(receiver.sId).emit("new-message", newMessage);
      }
    } catch (error) {
      console.error("Error handling new message:", error);
    }
  });

  socket.on("disconnect", () => {
    // console.log("a user disconnected", socket.userId);
    setUserOffline(socket.userId, socket.id);
  });
});

app.use((error, req, res, next) => {
  console.log(error.message);
  console.log(error.status);
  const statusCode = error.status >= 400 ? error.status : 500;
  res.status(statusCode);
  res.json({
    message: error.message,
    stack: process.env.NODE_ENV === "production" ? null : error.stack,
  });
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
