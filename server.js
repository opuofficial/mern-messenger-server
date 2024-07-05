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

const connectDB = require("./config/db");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

// app.use(morgan("tiny"));

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

io.use((socket, next) => {
  console.log("socket middleware");
  const token = socket.handshake.query.token;
  const userId = authenticateUser(token);
  console.log("from socket middleware", userId);
  if (userId) {
    socket.userId = userId;
    next();
  }
});

io.on("connection", (socket) => {
  console.log("a user connected", socket.userId);

  socket.on("disconnect", () => {
    console.log("a user disconnected", socket.userId);
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
