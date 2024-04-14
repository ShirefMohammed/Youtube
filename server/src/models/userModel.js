const mongoose = require("mongoose");
const ROLES_LIST = require("../utils/roles_list");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
      default:
        "https://firebasestorage.googleapis.com/v0/b/app-data-yo.appspot.com/o/defaultAvatar.png?alt=media&token=4f6c3434-f796-4d50-9a34-871813575ccd",
    },
    roles: {
      type: [Number],
      enum: [ROLES_LIST.User, ROLES_LIST.Editor, ROLES_LIST.Admin],
      default: [ROLES_LIST.User],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
    likedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: "videos" }],
    savedVideos: [{ type: mongoose.Schema.Types.ObjectId, ref: "videos" }],
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("users", userSchema);
module.exports = UserModel;
