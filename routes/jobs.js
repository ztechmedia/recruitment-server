const express = require("express");
const advanceResults = require("../middleware/advanceResults");
const {
  addJobs,
  getJobs,
  deleteJob,
  getJob,
  updateJob,
  getTotalJobs,
  applyJob,
  jobStatus,
  jobActivate,
} = require("../controllers/jobs");
const { protect, authorize } = require("../middleware/authHandler");
const Jobs = require("../models/Jobs");

const router = express.Router();

router
  .route("/")
  .get(advanceResults(Jobs), getJobs)
  .post(protect, authorize("admin"), addJobs);

router.get("/total-jobs", getTotalJobs);

router.route("/apply").post(protect, authorize("member"), applyJob);
router.post("/status", protect, authorize("admin"), jobStatus);
router.post("/activate", protect, authorize("admin"), jobActivate);

router
  .route("/:jobId")
  .get(getJob)
  .put(protect, authorize("admin"), updateJob)
  .delete(protect, authorize("admin"), deleteJob);

module.exports = router;
