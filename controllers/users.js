const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const {
  sendTokenResponse,
  removeFields,
  updateToReqBody,
  fileUpload,
} = require("../utils/utility");
const fs = require("fs");
const User = require("../models/User");

//@desc     get users
//@route    GET /api/v1/users
//@access   private
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advanceResults);
});

//@desc     get user
//@route    GET /api/v1/users/:userId
//@access   private
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.userId);

  if (!user) return next(new ErrorResponse("User not found", 404));

  res.status(200).json({ success: true, data: user });
});

//@desc     update password
//@route    POST /api/v1/users/update_password
//@access   private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  //check current password
  if (!(await user.matchPassword(req.body.currentPassword)))
    return next(new ErrorResponse("Password incorect", 401));

  user.password = req.body.newPassword;
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

//@desc     delete multiple users
//@route    DELETE /api/v1/users
//@access   private
exports.deleteUsers = asyncHandler(async (req, res, next) => {
  await User.deleteMany({
    _id: {
      $in: req.body._id,
    },
  });

  req.body._id.map((id) => {
    const path = `./public/files/user_${id}.pdf`;
    if (fs.existsSync(path)) fs.unlinkSync(path);
  });

  res.status(200).json({ success: true, data: req.body._id });
});

//@desc     create user
//@route    POST /api/v1/users
//@access   private
exports.addUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  if (req.body.role === "member") {
    req.body.social = {
      youtube: "http://youtube.com/",
      facebook: "http://facebook.com",
      linkedin: "http://linkedin.com",
      twitter: "http://twitter.com",
      instagram: "http://instagram.com",
    };
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

//@desc     update user
//@route    PUT /api/v1/users/:userId
//@access   private
exports.updateUser = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.params.userId);

  if (!user) return next(new ErrorResponse("User not found", 404));

  user = updateToReqBody(user, req.body);
  user.save(function (err) {
    if (err) {
      return next(err);
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  });
});

//@desc     add education
//@route    POST /api/v1/users/educations
//@access   private
exports.addEducation = asyncHandler(async (req, res, next) => {
  const education = {
    school: req.body.school,
    degree: req.body.degree,
    fieldofstudy: req.body.fieldofstudy,
    from: req.body.from,
    to: req.body.to,
    current: req.body.to ? false : true,
    description: req.body.description,
  };

  const user = req.user;
  user.educations.unshift(education);
  user.save();

  res.status(200).json({ success: true });
});

//@desc     update education
//@route    PUT /api/v1/users/educations/:eduId
//@access   private
exports.updateEducation = asyncHandler(async (req, res, next) => {
  const education = {
    school: req.body.school,
    degree: req.body.degree,
    fieldofstudy: req.body.fieldofstudy,
    from: req.body.from,
    to: req.body.to,
    current: req.body.to ? false : true,
    description: req.body.description,
  };

  const user = req.user;
  const eduIndex = user.educations
    .map((edu) => edu._id)
    .indexOf(req.params.eduId);
  user.educations[eduIndex] = education;
  user.save();

  res.status(200).json({ success: true });
});

//@desc     add experience
//@route    POST /api/v1/users/experiences
//@access   private
exports.addExperience = asyncHandler(async (req, res, next) => {
  const experience = {
    title: req.body.title,
    company: req.body.company,
    location: req.body.location,
    from: req.body.from,
    to: req.body.to,
    current: req.body.to ? false : true,
    description: req.body.description,
  };

  const user = req.user;
  user.experiences.unshift(experience);
  user.save();

  res.status(200).json({ success: true });
});

//@desc     update experience
//@route    PUT /api/v1/users/experiences/:expId
//@access   private
exports.updateExperience = asyncHandler(async (req, res, next) => {
  const experience = {
    title: req.body.title,
    company: req.body.company,
    location: req.body.location,
    from: req.body.from,
    to: req.body.to,
    current: req.body.to ? false : true,
    description: req.body.description,
  };

  const user = req.user;
  const expIndex = user.experiences
    .map((exp) => exp._id)
    .indexOf(req.params.expId);
  user.experiences[expIndex] = experience;
  user.save();

  res.status(200).json({ success: true });
});

//@desc     fetch educations
//@route    GET /api/v1/users/educations
//@access   private
exports.getEducations = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, data: req.user.educations });
});

//@desc     fetch experience
//@route    GET /api/v1/users/experience
//@access   private
exports.getExperiences = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, data: req.user.experiences });
});

//@desc     delete educations
//@route    Delete /api/v1/users/educations/5f2715d14af3f6033cd91e66
//@access   private
exports.deleteEducations = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const removeIndex = user.educations
    .map((edu) => edu._id)
    .indexOf(req.params.eduId);
  user.educations.splice(removeIndex, 1);
  user.save();

  res.status(200).json({ success: true, data: user.educations });
});

//@desc     delete educations
//@route    Delete /api/v1/users/educations/5f2715d14af3f6033cd91e66
//@access   private
exports.deleteExperiences = asyncHandler(async (req, res, next) => {
  const user = req.user;

  const removeIndex = user.experiences
    .map((exp) => exp._id)
    .indexOf(req.params.expId);
  user.experiences.splice(removeIndex, 1);
  user.save();

  res.status(200).json({ success: true, data: user.experiences });
});

//@desc     update profile
//@route    PUT /api/v1/users/update-profile
//@access   private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const {
    name,
    email,
    religion,
    birthPlace,
    birthDate,
    status,
    street,
    village,
    district,
    city,
    zipcode,
    province,
    facebook,
    instagram,
    twitter,
    youtube,
    linkedin,
  } = req.body;

  const profileFields = {};
  profileFields.name = name;
  profileFields.email = email;
  profileFields.religion = religion;
  profileFields.birthPlace = birthPlace;
  profileFields.birthDate = birthDate;
  profileFields.status = status;
  profileFields.address = {};
  profileFields.address.street = street;
  profileFields.address.village = village;
  profileFields.address.district = district;
  profileFields.address.city = city;
  profileFields.address.zipcode = zipcode;
  profileFields.address.province = province;
  profileFields.social = {};
  if (facebook) profileFields.social.facebook = facebook;
  if (instagram) profileFields.social.instagram = instagram;
  if (twitter) profileFields.social.twitter = twitter;
  if (youtube) profileFields.social.youtube = youtube;
  if (linkedin) profileFields.social.linkedin = linkedin;

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: profileFields,
    },
    { new: true }
  );

  res.status(200).json({ success: true, data: user });
});

//@desc     add resume
//@route    POST /api/v1/users/resume
//@access   private
exports.addResume = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const fileName = fileUpload(
    user._id,
    req.files.file,
    process.env.FILE_UPLOAD_PATH,
    next
  );

  user.resume = fileName;
  user.save();

  res.status(200).json({ success: true, data: fileName });
});
