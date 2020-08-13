const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };

  //replace error from error class to argument
  error.message = err.message;

  //log error
  console.log(err);

  //mongoose ObjectId not found
  if (err.name === "CastError") {
    const message = `Resource not found`;
    error = new ErrorResponse(message, 400);
  }

  //mongoose duplicate key
  if (err.code === 11000) {
    let message;
    for (let key in err.keyValue) {
      message = `Duplicate entered value for ${err.keyValue[key]}`;
    }
    error = new ErrorResponse(message, 400);
  }

  if (err.name === "ValidationError") {
    let errorArray = [];
    for (let field in err.errors) {
      errorArray.push({
        name: err.errors[field].path,
        message: err.errors[field].message,
      });
    }

    return res.status(400).json({
      success: false,
      error: errorArray,
    });
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

module.exports = errorHandler;
