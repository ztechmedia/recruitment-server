const express = require("express");
const advanceResults = require("../middleware/advanceResults");
const {
  getHires,
  getHire,
  deleteHires,
  interviewInvitation,
} = require("../controllers/hires");
const { protect, authorize } = require("../middleware/authHandler");
const Hires = require("../models/Hires");

const router = express.Router();

router.use(protect);
router.use(authorize("admin"));

router.route("/").get(advanceResults(Hires), getHires).delete(deleteHires);

router.route("/:hireId").get(getHire).put(interviewInvitation);

module.exports = router;
