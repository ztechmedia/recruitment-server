const mongoose = require("mongoose");

const CategoriesSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Pleas add a Job Category Name"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { versionKey: false },
  }
);

module.exports = mongoose.model("Categories", CategoriesSchema);
