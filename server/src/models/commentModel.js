const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videos",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const CommentModel = mongoose.model("comments", commentSchema);
module.exports = CommentModel;
