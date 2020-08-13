const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const Categories = require("../models/Categories");
const { updateToReqBody } = require("../utils/utility");

//@desc     get categories
//@route    GET /api/v1/categories
//@access   private
exports.getCategories = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advanceResults);
});

//@desc     add categories
//@route    POST /api/v1/categories
//@access   private
exports.addCategories = asyncHandler(async (req, res, next) => {
  const category = await Categories.create(req.body);
  res.status(200).json({ success: true, data: category });
});

//@desc     delete multiple categories
//@route    DELETE /api/v1/categories
//@access   private
exports.deleteCategories = asyncHandler(async (req, res, next) => {
  await Categories.deleteMany({
    _id: {
      $in: req.body._id,
    },
  });

  res.status(200).json({ success: true, data: req.body._id });
});

//@desc     fetch category
//@route    GET /api/v1/categories/:catId
//@access   private
exports.fetchCategory = asyncHandler(async (req, res, next) => {
  const category = await Categories.findById(req.params.catId);

  if (!category) return next(new ErrorResponse("Category not found", 404));

  res.status(200).json({ success: true, data: category });
});

//@desc     update category
//@route    PUT /api/v1/categories/:catId
//@access   private
exports.updateCategory = asyncHandler(async (req, res, next) => {
  let category = await Categories.findById(req.params.catId);

  if (!category) return next(new ErrorResponse("Category not found", 404));

  category = updateToReqBody(category, req.body);
  category.save();

  res.status(200).json({
    success: true,
    data: category,
  });
});
