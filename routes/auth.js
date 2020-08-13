const express = require("express");
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  checkTokenPassword,
} = require("../controllers/auth");

const router = express.Router();

const { protect } = require("../middleware/authHandler");

//auth routes
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:resettoken", resetPassword);
router.get("/check-token/:resettoken", checkTokenPassword);

module.exports = router;
