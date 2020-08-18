const path = require("path");
const dotenv = require("dotenv");
const colors = require("colors");
const express = require("express");
const morgan = require("morgan");
const fileupload = require("express-fileupload");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const cors = require("cors");
const hpp = require("hpp");
const rateLimit = require("express-rate-limit");

//connectDB
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

//load env
dotenv.config({ path: "./config/config.env" });

//connect to DB
connectDB();

//route files
const auth = require("./routes/auth");
const users = require("./routes/users");
const categories = require("./routes/categories");
const jobs = require("./routes/jobs");
const hires = require("./routes/hires");

const app = express();

//body parser
app.use(express.json());

//dev log middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//use fileupload
app.use(fileupload());

//sanitize data
app.use(mongoSanitize());

//security header
app.use(helmet());

//prevent xss attack
app.use(xss());

//enable cors
app.use(cors());

//rate limit (limit request to server in specific time)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, //10 minutes
  max: 100, //number of request
});

app.use(limiter);

//prevent http params polution
app.use(hpp());

//set static folder
app.use(
  "/images/users",
  express.static(path.join(__dirname, "public/images/users"))
);
app.use("/files", express.static(path.join(__dirname, "public/files")));
app.use("/images", express.static(path.join(__dirname, "public/images")));

//mount routes
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/categories", categories);
app.use("/api/v1/jobs", jobs);
app.use("/api/v1/hires", hires);

app.use(errorHandler);

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in: ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
      .bold
  )
);

//handle unhandler promise rejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  //close server & exit process
  server.close(() => process.exit(1));
});
