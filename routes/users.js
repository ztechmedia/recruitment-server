const express = require("express");
const {
  updatePassword,
  getUsers,
  deleteUsers,
  addUser,
  getUser,
  updateUser,
  addEducation,
  updateEducation,
  addExperience,
  getEducations,
  getExperiences,
  deleteEducations,
  deleteExperiences,
  updateExperience,
  updateProfile,
} = require("../controllers/users");
const User = require("../models/User");
const advancedResults = require("../middleware/advanceResults");
const { protect, authorize } = require("../middleware/authHandler");

const router = express.Router();

router.use(protect);

router
  .route("/")
  .get(advancedResults(User), getUsers)
  .delete(deleteUsers)
  .post(addUser);

router.post("/change-password", updatePassword);
router.route("/educations").post(addEducation).get(getEducations);
router.route("/experiences").post(addExperience).get(getExperiences);

router
  .route("/:userId")
  .get(authorize("admin"), getUser)
  .put(authorize("admin", "member"), updateUser);

router
  .route("/educations/:eduId")
  .delete(deleteEducations)
  .put(updateEducation);

router
  .route("/experiences/:expId")
  .delete(deleteExperiences)
  .put(updateExperience);

router.post("/update-profile", updateProfile);

module.exports = router;
