const mongoose = require("mongoose");

const HiresSchema = new mongoose.Schema(
  {
    jobName: {
      type: String,
    },
    session: {
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
    minDegree: {
      type: String,
    },
    minSallary: {
      type: Number,
    },
    maxSallary: {
      type: Number,
    },
    applicants: [
      {
        user: {
          _id: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
          },
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
