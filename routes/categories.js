const express = require("express");
const advanceResults = require("../middleware/advanceResults");
const {
  addCategories,
  getCategories,
  deleteCategories,
  fetchCategory,
  updateCategory,
} = require("../controllers/categories");
const { protect, authorize } = require("../middleware/authHandler");
const Categories = require("../models/Categories");

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router
  .route("/")
  .get(advanceResults(Categories), getCategories)
  .post(addCategories)
  .delete(deleteCategories);

router.route("/:catId").get(fetchCategory).put(updateCategory);

module.exports = router;
