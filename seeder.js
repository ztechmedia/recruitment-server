const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");

//load env vars
dotenv.config({ path: "./config/config.env" });

//load models
const User = require("./models/User");
const Categories = require("./models/Categories");
const Jobs = require("./models/Jobs");

//connect to DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

//read json files
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/_data/_users.json`, "utf-8")
);

//import data
const importData = async () => {
  try {
    await User.create(users);
    console.log("Data Imported..".green.inverse);
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

//delete data
const deleteData = async () => {
  await User.deleteMany();
  await Categories.deleteMany();
  await Jobs.deleteMany();
  console.log("Data Destroyed..".red.inverse);
  process.exit();
};

if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  deleteData();
}
