const mongoose = require("mongoose");

const JobsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Pleas add a Job Category Name"],
    },
    categories: {
      type: mongoose.Schema.ObjectId,
      ref: "Categories",
      required: true,
    },
    minSallary: {
      type: Number,
      required: [true, "Please add a minimal sallary for this job"],
    },
    maxSallary: {
      type: Number,
    },
    minDegree: {
      type: String,
    },
    description: {
      type: String,
      required: [true, "Pleas add some description for this job"],
    },
    users: [
      {
        _id: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
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

module.exports = mongoose.model("Jobs", JobsSchema);
