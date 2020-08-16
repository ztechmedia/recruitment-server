const mongoose = require("mongoose");

const HiresSchema = new mongoose.Schema(
  {
    jobName: {
      type: String,
    },
    category: {
      type: String,
    },
    totalApplicants: {
      type: Number,
    },
    acceptedApplicants: {
      type: Number,
    },
    rejectedApplicants: {
      type: Number,
    },
    applicants: [
      {
        user: {
          name: {
            type: String,
          },
          educations: [],
          experiences: [],
        },
        status: {
          type: String,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { versionKey: false },
  }
);

module.exports = mongoose.model("Hires", HiresSchema);
