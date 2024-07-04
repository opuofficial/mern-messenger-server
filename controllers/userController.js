const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSignup = async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    const error = new Error("Username and password are required");
    error.status = 400;
    return next(error);
  }

  const usernameExist = await User.findOne({ username });

  if (usernameExist) {
    const error = new Error("Username already taken");
    error.status = 409;
    return next(error);
  }

  if (password.length < 6) {
    const error = new Error("Password must be at least 6 characters long");
    error.status = 400;
    return next(error);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    username,
    password: hashedPassword,
  });

  try {
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    next(error);
  }
};

const userSignin = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      const error = new Error("Invalid credentials");
      error.status = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const error = new Error("Invalid credentials");
      error.status = 401;
      throw error;
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d",
    });

    res.json({
      token,
      username: user.username,
    });
  } catch (error) {
    next(error);
  }
};

const userSearch = async (req, res, next) => {
  console.log(req.user);
  try {
    const { query } = req.query;
    const currentUserId = req.user.userId;

    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    const users = await User.find({
      username: new RegExp(query, "i"),
      _id: { $ne: currentUserId },
    }).select("-password");

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports = {
  userSignup,
  userSignin,
  userSearch,
};
