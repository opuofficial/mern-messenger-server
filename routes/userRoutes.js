const express = require("express");
const {
  userSignup,
  userSignin,
  userSearch,
} = require("../controllers/userController");
const router = express.Router();
const verifyToken = require("../middlewares/verifyToken");

router.post("/signup", userSignup);
router.post("/signin", userSignin);
router.get("/search", verifyToken, userSearch);

module.exports = router;
