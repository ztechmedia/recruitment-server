const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const Jobs = require("../models/Jobs");
const User = require("../models/User");
const Hires = require("../models/Hires");
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
  const total = await Jobs.find({ status: "Active" }).countDocuments();
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

//@desc     job status
//@route    POST /api/v1/jobs/status
//@access   private
exports.jobStatus = asyncHandler(async (req, res, next) => {
  const job = await Jobs.findById(req.body.jobId).populate({
    path: "users._id",
    select: "name address educations experiences social",
  });

  if (!job) return new ErrorResponse("Job not found", 404);

  const user = await User.findById(req.body.userId);
  if (!user) return new ErrorResponse("User not found", 404);

  const userIndex = job.users
    .map((user) => user._id._id)
    .indexOf(req.body.userId);
  job.users[userIndex].status = req.body.status;
  job.save();

  res.status(200).json({ success: true, data: job });
});

//@desc     job activate
//@route    POST /api/v1/jobs/activate
//@access   private
exports.jobActivate = asyncHandler(async (req, res, next) => {
  const job = await Jobs.findById(req.body.jobId).populate({
    path: "users._id",
    select: "name educations experiences",
  });

  job.status = req.body.status;
  if (req.body.status === "Active") {
    job.session = job.session + 1;
  } else {
    totalRejected = job.users
      ? job.users.find((user) => user.status === "Filtered")
      : null;

    totalAccepted = job.users
      ? job.users.find((user) => user.status === "Accepted")
      : null;

    const applicants = [];

    job.users
      ? job.users.map((user) => {
          const educations = [];
          const experiences = [];

          if (user._id.educations.length > 0) {
            user._id.educations.map((edu) => {
              const eduDetail = `${edu.degree} - ${edu.school}`;
              educations.unshift(eduDetail);
            });
          }

          if (user._id.experiences.length > 0) {
            user._id.experiences.map((exp) => {
              const expDetail = `${exp.title} - ${exp.company} @${exp.location}`;
              experiences.unshift(expDetail);
            });
          }

          const userDdata = {
            user: {
              name: user._id.name,
              educations: educations,
              experiences: experiences,
            },
            status: user.status,
          };

          applicants.unshift(userDdata);
        })
      : null;

    const data = {
      jobName: job.name,
      category: "...",
      totalApplicants: job.users ? job.users.length : 0,
      acceptedApplicants: totalAccepted ? totalAccepted.length : 0,
      rejectedApplicants: totalRejected ? totalRejected.length : 0,
      applicants: applicants,
    };

    await Hires.create(data);
  }

  job.save();

  res.status(200).json({ success: true, data: job });
});
