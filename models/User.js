const crypto = require("crypto");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "E-Mail is required"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      default: "member",
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    religion: String,
    birthPlace: String,
    birthDate: Date,
    status: String,
    address: {
      street: String,
      province: String,
      city: String,
      district: String,
      village: String,
      zipcode: Number,
    },
    experiences: [
      {
        title: {
          type: String,
        },
        company: {
          type: String,
        },
        location: {
          type: String,
        },
        from: {
          type: Number,
        },
        to: {
          type: Number,
        },
        current: {
          type: Boolean,
          default: false,
        },
        description: {
          type: String,
        },
      },
    ],
    educations: [
      {
        school: {
          type: String,
        },
        degree: {
          type: String,
        },
        fieldofstudy: {
          type: String,
        },
        from: {
          type: Number,
        },
        to: {
          type: Number,
        },
        current: {
          type: Boolean,
          default: false,
        },
        description: {
          type: String,
        },
      },
    ],
    social: {
      youtube: String,
      twitter: String,
      facebook: String,
      linkedin: String,
      instagram: String,
    },
    resume: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { versionKey: false },
  }
);

//encrypt password before save
UserSchema.pre("save", async function (next) {
  //if password not modified skip this process
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//sign jwt and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

//match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

//generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
  //generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  //hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //set expire
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; //10 minutes
  return resetToken;
};

module.exports = mongoose.model("User", UserSchema);
