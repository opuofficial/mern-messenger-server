require("dotenv").config();

const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const PORT = process.env.PORT || 3001;
const connectDB = require("./config/db");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());

app.use(morgan("tiny"));

connectDB();

app.use("/user", require("./routes/userRoutes"));
app.use("/chats", require("./routes/chatRoutes"));

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

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
