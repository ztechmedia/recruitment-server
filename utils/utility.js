//send token from model User
exports.sendTokenResponse = (user, statusCode, res) => {
  //create token
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    expiresIn: 3600, //1hour valid token
    userLogged: user,
  });
};

//upload file
exports.fileUpload = (id, file, pathUpload, next) => {
  const ErrorResponse = require("./errorResponse");
  const path = require("path");

  if (!file) {
    return next(new ErrorResponse("Please upload a file", 400));
  }

  //make sure the file is images
  if (!file.mimetype === "application/pdf") {
    return next(new ErrorResponse("Please upload a pdf file", 400));
  }
  //check the file size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload a file size less than ${process.env.MAX_FILE_UPLOAD} (1MB)`,
        400
      )
    );
  }

  //create custom filename
  file.name = `user_${id}${path.parse(file.name).ext}`;

  file.mv(`${pathUpload}/${file.name}`, async (err) => {
    if (err) {
      new ErrorResponse("Problem with file upload", 500);
    }
  });

  return file.name;
};

//remove field
exports.removeFields = (model, removeFields) => {
  removeFields.forEach((param) => delete model._doc[param]);
  return model;
};

//update req body to model
exports.updateToReqBody = (model, reqBody) => {
  for (let key in reqBody) {
    model[key] = reqBody[key];
  }

  return model;
};
