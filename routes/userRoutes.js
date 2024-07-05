const express = require("express");
const {
  userSignup,
  userSignin,
  userSearch,
  getReceiverUsername,
} = require("../controllers/userController");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");

router.post("/signup", userSignup);
router.post("/signin", userSignin);
router.get("/search", verifyToken, userSearch);
router.get("/info/:id", verifyToken, getReceiverUsername);

module.exports = router;
