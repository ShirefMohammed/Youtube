const mongoose = require("mongoose");
const NOTIFICATIONS_TYPES_LIST = require("../utils/notifications_types_list");

const notificationSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: [
        NOTIFICATIONS_TYPES_LIST.NEW_SUBSCRIBER,
        NOTIFICATIONS_TYPES_LIST.NEW_COMMENT,
      ],
      required: true,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "comments",
    },
  },
  {
    timestamps: true,
  }
);

const NotificationModel = mongoose.model("notifications", notificationSchema);
module.exports = NotificationModel;
