const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const Jobs = require("../models/Jobs");
const { updateToReqBody } = require("../utils/utility");

//@desc     get jobs
//@route    GET /api/v1/jobs
//@access   private
exports.getJobs = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advanceResults);
});

//@desc     get total jobs
//@route    GET /api/v1/jobs/total-jobs
//@access   private
exports.getTotalJobs = asyncHandler(async (req, res, next) => {
  const total = await Jobs.countDocuments();
  res.status(200).json({ success: true, data: total });
});

//@desc     get job
//@route    GET /api/v1/jobs/:jobId
//@access   private
exports.getJob = asyncHandler(async (req, res, next) => {
  const job = await Jobs.findById(req.params.jobId).populate({
    path: "users._id",
    select: "name address educations experiences social",
  });

  if (!job) return next(new ErrorResponse("Job not found", 404));

  res.status(200).json({ success: true, data: job });
});

//@desc     add jobs
//@route    POST /api/v1/jobs
//@access   private
exports.addJobs = asyncHandler(async (req, res, next) => {
  const job = await Jobs.create(req.body);

  res.status(200).json({
    success: true,
    data: job,
  });
});

//@desc     update category
//@route    PUT /api/v1/categories/:catId
//@access   private
exports.updateJob = asyncHandler(async (req, res, next) => {
  let job = await Jobs.findById(req.params.jobId);

  if (!job) return next(new ErrorResponse("Job not found", 404));

  job = updateToReqBody(job, req.body);
  job.save();

  res.status(200).json({
    success: true,
    data: job,
  });
});

//@desc     delete job
//@route    DELETE /api/v1/jobs/:jobId
//@access   private
exports.deleteJob = asyncHandler(async (req, res, next) => {
  const job = await Jobs.findById(req.params.jobId);

  if (!job) return next(new ErrorResponse("Job not fround", 404));

  job.deleteOne();

  res.status(200).json({ success: true, data: req.params.jobId });
});

//@desc     apply job
//@route    POST /api/v1/jobs/apply
//@access   private
exports.applyJob = asyncHandler(async (req, res, next) => {
  const jobId = req.body.jobId;
  const user = req.user;

  const data = {
    _id: user._id,
    status: "Applyed",
  };

  const job = await Jobs.findById(jobId);
  job.users.unshift(data);
  job.save();

  res.status(200).json({ success: true, data: job });
});
