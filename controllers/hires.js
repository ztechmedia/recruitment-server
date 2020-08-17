const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const sendMail = require("../utils/sendMail");
const Hires = require("../models/Hires");
const User = require("../models/User");

//@desc     get hires
//@route    GET /api/v1/hires
//@access   private
exports.getHires = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advanceResults);
});

//@desc     fetch hire
//@route    GET /api/v1/hires/:hireId
//@access   private
exports.getHire = asyncHandler(async (req, res, next) => {
  const hire = await Hires.findById(req.params.hireId);

  if (!hire) return next(new ErrorResponse("Hire not found", 404));

  res.status(200).json({ success: true, data: hire });
});

//@desc     applicants interview invitation
//@route    PUT /api/v1/hires/:hireId
//@access   private
exports.interviewInvitation = asyncHandler(async (req, res, next) => {
  const hire = await Hires.findById(req.params.hireId);
  if (!hire) return next(new ErrorResponse("Hire not found", 404));
  const appIndex = hire.applicants
    .map((app) => app._id)
    .indexOf(req.body.appId);
  const userId = hire.applicants[appIndex].user._id;
  const user = await User.findById(userId);
  if (!user) return next(new ErrorResponse("User not found", 404));
  const date = req.body.date;

  try {
    const message = `We are invite you to interview for position ${hire.jobName} at ${date}`;
    await sendMail({
      email: user.email,
      subject: "Interview Invitation @ PT.ABCD",
      message: message,
    });

    hire.applicants[appIndex].status = `Invitation sent on ${req.body.date}`;
    hire.save();

    res.status(200).json({
      success: true,
      data: hire,
    });
  } catch (err) {
    console.log(err);
    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

//@desc     delete multiple hires
//@route    DELETE /api/v1/hires
//@access   private
exports.deleteHires = asyncHandler(async (req, res, next) => {
  await Hires.deleteMany({
    _id: {
      $in: req.body._id,
    },
  });

  res.status(200).json({ success: true, data: req.body._id });
});
