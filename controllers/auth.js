const colors = require("colors");
const crypto = require("crypto");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const sendMail = require("../utils/sendMail");
const { sendTokenResponse, removeFields } = require("../utils/utility");
const User = require("../models/User");

//@desc     register user
//@route    POST /api/v1/auth/register
//@access   public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  req.body.social = {
    youtube: "http://youtube.com/",
    facebook: "http://facebook.com",
    linkedin: "http://linkedin.com",
    twitter: "http://twitter.com",
    instagram: "http://instagram.com",
  };

  //vlaidate email and password
  if (!name || !email || !password)
    return next(new ErrorResponse("Please provide an email & password", 400));

  //create user
  const user = await User.create(req.body);
  const newUser = removeFields(user, [
    "password",
    "education",
    "experience",
    "createdAt",
  ]);
  sendTokenResponse(newUser, 200, res);
});

//@desc     login user
//@route    POST /api/v1/auth/login
//@access   public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //vlaidate email and password
  if (!email || !password)
    return next(new ErrorResponse("Please provide an email & password", 400));

  //check for user
  const user = await User.findOne({ email }).select(
    "name email role +password"
  );

  if (!user) return next(new ErrorResponse("Email not found in database", 401));

  //compare password
  const isMatch = await user.matchPassword(password);

  if (!isMatch) return next(new ErrorResponse("Invalid password", 401));

  delete user._doc.password;

  sendTokenResponse(user, 200, res);
});

//@desc     get current user login detail
//@route    GET /api/v1/auth/me
//@access   private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) return next(new ErrorResponse("User not found", 404));

  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc     forgot password
//@route    POST /api/v1/auth/fotgot-password
//@access   private
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({
    email: req.body.email,
  });

  if (!user)
    return next(new ErrorResponse("There is no user with that email", 404));

  //get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  //create reset url
  // const resetUrl = `${req.protocol}://${req.get(
  //   "host"
  // )}/api/v1/auth/reset_password/${resetToken}`;

  const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested 
    the reset of a password. Please make a PUT request to : ${resetUrl}`;

  try {
    await sendMail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    res.status(200).json({
      success: true,
      data: "Email sent",
    });
  } catch (err) {
    console.log(`${err}`.red.underline);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.save({
      validateBeforeSave: false,
    });
    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

//@desc     reset password
//@route    POST /api/v1/auth/reset-password/:resettoken
//@access   public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  //get hashed token from
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });

  if (!user) return next(new ErrorResponse("Invalid token", 400));

  //set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  const newUser = removeFields(user, [
    "password",
    "address",
    "religion",
    "birthPlace",
    "birthDate",
    "status",
    "education",
    "experience",
    "social",
    "createdAt",
  ]);

  sendTokenResponse(newUser, 200, res);
});

//@desc     check token password
//@route    GET /api/v1/auth/check-token
//@access   public
exports.checkTokenPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now(),
    },
  });

  if (!user)
    return next(new ErrorResponse("Token is invalid or expireds", 400));

  res.status(200).json({ success: true });
});
