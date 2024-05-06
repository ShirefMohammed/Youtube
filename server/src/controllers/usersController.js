const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const asyncHandler = require("../middleware/asyncHandler");
const UserModel = require("../models/userModel");
const VideoModel = require("../models/videoModel");
const CommentModel = require("../models/commentModel");
const NotificationModel = require("../models/notificationModel");
const ROLES_LIST = require("../utils/roles_list");
const NOTIFICATIONS_TYPES_LIST = require("../utils/notifications_types_list");
const httpStatusText = require("../utils/httpStatusText");
const checkIfExistsInFirebase = require("../utils/checkIfExistsInFirebase");
const deleteFromFirebase = require("../utils/deleteFromFirebase");
const sendResponse = require("../utils/sendResponse");

// Regular expressions
const NAME_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const PASS_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

const getUsers = asyncHandler(async (req, res) => {
  const query = req.query;

  const limit = query?.limit || 10;
  const page = query?.page || 1;
  const skip = (page - 1) * limit;

  let searchQuery = {};

  if (query?.onlyEditors) {
    searchQuery = { ...searchQuery, roles: { $in: [ROLES_LIST.Editor] } };
  }

  if (query?.onlyAdmins) {
    searchQuery = { ...searchQuery, roles: { $in: [ROLES_LIST.Admin] } };
  }

  const users = await UserModel.find(
    searchQuery,
    "-subscribers -subscriptions -likedVideos -savedVideos -password"
  )
    .skip(skip)
    .limit(limit);

  sendResponse(
    res,
    200,
    httpStatusText.SUCCESS,
    "Successful fetching users",
    users
  );
});

const searchUsers = asyncHandler(async (req, res) => {
  const query = req.query;

  const limit = query?.limit || 10;
  const page = query?.page || 1;
  const skip = (page - 1) * limit;

  let searchQuery = {
    roles: { $in: [ROLES_LIST.User] },
    $or: [
      { name: { $regex: query?.searchKey, $options: "i" } },
      { email: { $regex: query?.searchKey, $options: "i" } },
    ],
  };

  const users = await UserModel.find(
    searchQuery,
    "-subscribers -subscriptions -likedVideos -savedVideos -password"
  )
    .skip(skip)
    .limit(limit);

  sendResponse(
    res,
    200,
    httpStatusText.SUCCESS,
    "Successful fetching users",
    users
  );
});

const getSuggestedUsers = asyncHandler(async (req, res) => {
  const userId = req.userInfo.userId;
  let exceptedUsers = req.query?.exceptedUsers?.split(",") || [];
  const limit = +req.query?.limit || 5;

  const user = await UserModel.findById(userId, "subscriptions");

  if (!user) {
    return res.status(404).json({
      status: httpStatusText.FAIL,
      message: "Account not found",
      data: null,
    });
  }

  exceptedUsers = [userId, ...user.subscriptions, ...exceptedUsers];

  const suggestedUsers = await UserModel.aggregate([
    {
      $match: {
        _id: {
          $nin: exceptedUsers.map((id) => new mongoose.Types.ObjectId(id)),
        },
      },
    },
    { $sample: { size: limit } },
    {
      $project: {
        _id: 1,
        name: 1,
        email: 1,
        roles: 1,
        avatarUrl: 1,
        isVerified: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  sendResponse(
    res,
    200,
    httpStatusText.SUCCESS,
    "Successful fetching users",
    suggestedUsers
  );
});

const getUser = asyncHandler(async (req, res) => {
  const userId = req.params.userId;

  let user = await UserModel.findById(
    userId,
    "-subscribers -subscriptions -likedVideos -savedVideos -password"
  );

  if (!user) {
    return sendResponse(
      res,
      404,
      httpStatusText.FAIL,
      `User with id ${userId} not found`,
      null
    );
  }

  sendResponse(
    res,
    200,
    httpStatusText.SUCCESS,
    "Successful fetching user",
    user
  );
});

const updateUser = asyncHandler(async (req, res) => {
  const userInfo = req.userInfo;
  const userId = req.params.userId;
  const { name, avatarUrl, oldPassword, newPassword } = req.body;

  if (userInfo.userId != userId) {
    return sendResponse(res, 403, httpStatusText.FAIL, "Forbidden", null);
  }

  const user = await UserModel.findById(userId).select(
    "-subscribers -subscriptions -likedVideos -savedVideos"
  );

  if (!user) {
    return sendResponse(
      res,
      404,
      httpStatusText.FAIL,
      `User with id ${userId} is not found`,
      null
    );
  }

  let message = "Account updated successFully.";
  let updatedFields = {};

  if (name) {
    if (!NAME_REGEX.test(name)) {
      message += ` Name is not updated because Name must be 4 to 24 characters, Must begin with a letter, Letters, numbers, underscores, hyphens allowed, No spaces.`;
    } else {
      updatedFields.name = name;
    }
  }

  if (avatarUrl) {
    if (!(await checkIfExistsInFirebase(avatarUrl))) {
      message += ` Avatar is not updated because an error happen in the client while uploading avatar picture.`;
    } else {
      if (
        user.avatarUrl !==
        `https://firebasestorage.googleapis.com/v0/b/app-data-yo.appspot.com/o/defaultAvatar.png?alt=media&token=4f6c3434-f796-4d50-9a34-871813575ccd`
      ) {
        await deleteFromFirebase(user.avatarUrl);
      }

      updatedFields.avatarUrl = avatarUrl;
    }
  }

  if (oldPassword && !newPassword) {
    message += " Password is not updated because new password is required.";
  }

  if (!oldPassword && newPassword) {
    message += " Password is not updated because old password is required.";
  }

  if (oldPassword && newPassword) {
    const IsOldPasswordCorrect = await bcrypt.compare(
      oldPassword,
      user.password
    );

    if (!IsOldPasswordCorrect) {
      message += " Password is not updated because old password is wrong.";
    } else {
      if (!PASS_REGEX.test(newPassword)) {
        message += ` Password is not updated because Password must be 8 to 24 characters, Must include uppercase and lowercase letters , a number and a special character, Allowed special characters: !, @, #, $, %.`;
      } else {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        updatedFields.password = hashedPassword;
      }
    }
  }

  const updatedUser = await UserModel.findByIdAndUpdate(userId, updatedFields, {
    new: true,
  }).select("-subscribers -subscriptions -likedVideos -savedVideos -password");

  sendResponse(res, 200, httpStatusText.SUCCESS, message, updatedUser);
});

const deleteUser = asyncHandler(async (req, res) => {
  const userInfo = req.userInfo;
  const userId = req.params.userId;
  const { password } = req.body;

  if (userInfo.userId != userId && !userInfo.roles.includes(ROLES_LIST.Admin)) {
    return sendResponse(res, 403, httpStatusText.FAIL, "Forbidden", null);
  }

  const user = await UserModel.findById(userId).select(
    "_id avatarUrl password"
  );

  if (!user) {
    return sendResponse(
      res,
      404,
      httpStatusText.FAIL,
      `User with id ${userId} not found`,
      null
    );
  }

  if (!userInfo.roles.includes(ROLES_LIST.Admin)) {
    if (!password) {
      return sendResponse(
        res,
        400,
        httpStatusText.FAIL,
        "Password is required",
        null
      );
    }

    const IsPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!IsPasswordCorrect) {
      return sendResponse(
        res,
        401,
        httpStatusText.FAIL,
        "Wrong password",
        null
      );
    }
  }

  // Delete user avatarUrl
  if (
    user.avatarUrl !==
    "https://firebasestorage.googleapis.com/v0/b/app-data-yo.appspot.com/o/defaultAvatar.png?alt=media&token=4f6c3434-f796-4d50-9a34-871813575ccd"
  ) {
    await deleteFromFirebase(user.avatarUrl);
  }

  const videos = await VideoModel.find(
    { creator: user._id },
    "_id thumbnailUrl videoUrl"
  );

  // Delete user videos comments, thumbnailUrl and videoUrl
  videos.map(async (video) => {
    await CommentModel.deleteMany({ video: video._id });
    await deleteFromFirebase(video.thumbnailUrl);
    await deleteFromFirebase(video.videoUrl);
  });

  // Delete user videos
  await VideoModel.deleteMany({ creator: user._id });

  // Delete user comments
  await CommentModel.deleteMany({ creator: user._id });

  // Delete user notifications
  await NotificationModel.deleteMany({
    $or: [{ sender: user._id }, { receiver: user._id }],
  });

  // Delete this user
  await user.deleteOne();

  sendResponse(res, 204, httpStatusText.SUCCESS, "", null);
});

const getSubscribers = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const query = req.query;

  const limit = query?.limit || 10;
  const page = query?.page || 1;
  const skip = (page - 1) * limit;

  // Get userId subscribers
  const { subscribers } = await UserModel.findById(userId)
    .select("subscribers")
    .populate({
      path: "subscribers",
      select: "-subscribers -subscriptions -likedVideos -savedVideos -password",
      options: {
        skip: skip,
        limit: limit,
      },
    });

  sendResponse(
    res,
    200,
    httpStatusText.SUCCESS,
    "Successful fetching subscribers",
    subscribers
  );
});

const IsUserSubscriber = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const targetUserId = req.params.targetUserId;

  // Check if targetUserId exists in userId subscribers
  const isUserSubscriber = await UserModel.exists({
    _id: userId,
    subscribers: targetUserId,
  });

  sendResponse(res, 200, httpStatusText.SUCCESS, "", Boolean(isUserSubscriber));
});

const removeSubscriber = asyncHandler(async (req, res) => {
  const userInfo = req.userInfo;
  const userId = req.params.userId;
  const targetUserId = req.params.targetUserId;

  if (userInfo.userId !== userId) {
    return sendResponse(res, 403, httpStatusText.FAIL, "Forbidden", null);
  }

  // Remove targetUserId from userId subscribers
  await UserModel.updateOne(
    { _id: userId },
    { $pull: { subscribers: targetUserId } }
  );

  await UserModel.updateOne(
    { _id: targetUserId },
    { $pull: { subscriptions: userId } }
  );

  sendResponse(res, 204, httpStatusText.SUCCESS, "", null);
});

const getSubscriptions = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const query = req.query;

  const limit = query?.limit || 10;
  const page = query?.page || 1;
  const skip = (page - 1) * limit;

  // Get userId subscriptions
  const { subscriptions } = await UserModel.findById(userId)
    .select("subscriptions")
    .populate({
      path: "subscriptions",
      select: "-subscribers -subscriptions -likedVideos -savedVideos -password",
      options: {
        skip: skip,
        limit: limit,
      },
    });

  sendResponse(
    res,
    200,
    httpStatusText.SUCCESS,
    "Successful fetching subscriptions",
    subscriptions
  );
});

const IsUserSubscribed = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const targetUserId = req.params.targetUserId;

  // Check if userId subscribed targetUserId
  const isUserSubscribed = await UserModel.exists({
    _id: userId,
    subscriptions: targetUserId,
  });

  sendResponse(res, 200, httpStatusText.SUCCESS, "", Boolean(isUserSubscribed));
});

const subscribe = asyncHandler(async (req, res) => {
  const userInfo = req.userInfo;
  const userId = req.params.userId;
  const targetUserId = req.params.targetUserId;

  if (userInfo.userId !== userId) {
    return sendResponse(res, 403, httpStatusText.FAIL, "Forbidden", null);
  }

  // userId subscribes targetUserId
  await UserModel.updateOne(
    { _id: userId },
    { $pull: { subscriptions: targetUserId } }
  );

  await UserModel.updateOne(
    { _id: userId },
    { $push: { subscriptions: targetUserId } }
  );

  await UserModel.updateOne(
    { _id: targetUserId },
    { $pull: { subscribers: userId } }
  );

  await UserModel.updateOne(
    { _id: targetUserId },
    { $push: { subscribers: userId } }
  );

  // Create NEW_SUBSCRIBER notification
  const newNotification = await NotificationModel.create({
    sender: userId,
    receiver: targetUserId,
    type: NOTIFICATIONS_TYPES_LIST.NEW_SUBSCRIBER,
  });

  // Populate the 'newNotification.sender' field
  await newNotification.populate({
    path: "sender",
    select: "_id name email avatarUrl",
  });

  // Populate the 'newNotification.receiver' field
  await newNotification.populate({
    path: "receiver",
    select: "_id name email avatarUrl",
  });

  sendResponse(res, 200, httpStatusText.SUCCESS, "User is subscribed", {
    notification: newNotification,
  });
});

const unsubscribe = asyncHandler(async (req, res) => {
  const userInfo = req.userInfo;
  const userId = req.params.userId;
  const targetUserId = req.params.targetUserId;

  if (userInfo.userId !== userId) {
    return sendResponse(res, 403, httpStatusText.FAIL, "Forbidden", null);
  }

  // userId unsubscribes targetUserId
  await UserModel.updateOne(
    { _id: userId },
    { $pull: { subscriptions: targetUserId } }
  );

  await UserModel.updateOne(
    { _id: targetUserId },
    { $pull: { subscribers: userId } }
  );

  // Delete NEW_SUBSCRIBER notification
  await NotificationModel.deleteOne({
    sender: userId,
    receiver: targetUserId,
    type: NOTIFICATIONS_TYPES_LIST.NEW_SUBSCRIBER,
  });

  sendResponse(res, 204, httpStatusText.SUCCESS, "", null);
});

const getNotifications = asyncHandler(async (req, res) => {
  const userInfo = req.userInfo;
  const userId = req.params.userId;

  if (userInfo.userId != userId) {
    return sendResponse(res, 403, httpStatusText.FAIL, "Forbidden", null);
  }

  const notifications = await NotificationModel.find({ receiver: userId })
    .populate({
      path: "sender",
      select: "_id name email avatarUrl",
    })
    .populate({
      path: "receiver",
      select: "_id name email avatarUrl",
    })
    .populate({
      path: "comment",
    })
    .sort({ createdAt: -1 });

  sendResponse(
    res,
    200,
    httpStatusText.SUCCESS,
    "Successful fetching notifications",
    notifications
  );
});

const getNotification = asyncHandler(async (req, res) => {
  const userInfo = req.userInfo;
  const userId = req.params.userId;
  const notificationId = req.params.notificationId;

  if (userInfo.userId != userId) {
    return sendResponse(res, 403, httpStatusText.FAIL, "Forbidden", null);
  }

  const notification = await NotificationModel.findOne({
    _id: notificationId,
    receiver: userId,
  })
    .populate({
      path: "sender",
      select: "_id name email avatarUrl",
    })
    .populate({
      path: "receiver",
      select: "_id name email avatarUrl",
    })
    .populate({
      path: "comment",
    });

  sendResponse(
    res,
    200,
    httpStatusText.SUCCESS,
    "Successful fetching notification",
    notification
  );
});

const updateNotification = asyncHandler(async (req, res) => {
  const userInfo = req.userInfo;
  const userId = req.params.userId;
  const notificationId = req.params.notificationId;
  const { isRead } = req.body;

  if (userInfo.userId != userId) {
    return sendResponse(res, 403, httpStatusText.FAIL, "Forbidden", null);
  }

  await NotificationModel.updateOne(
    { _id: notificationId, receiver: userId },
    { isRead: isRead }
  );

  sendResponse(
    res,
    200,
    httpStatusText.SUCCESS,
    "Notification is updated",
    true
  );
});

const deleteNotification = asyncHandler(async (req, res) => {
  const userInfo = req.userInfo;
  const userId = req.params.userId;
  const notificationId = req.params.notificationId;

  if (userInfo.userId != userId) {
    return sendResponse(res, 403, httpStatusText.FAIL, "Forbidden", null);
  }

  await NotificationModel.deleteOne({
    _id: notificationId,
    receiver: userId,
  });

  sendResponse(res, 204, httpStatusText.SUCCESS, "", null);
});

const getCreatedVideos = asyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const query = req.query;

  const limit = query?.limit || 10;
  const page = query?.page || 1;
  const skip = (page - 1) * limit;

  const videos = await VideoModel.find({ creator: userId })
    .populate({ path: "creator", select: "_id name email avatarUrl" })
    .select("-likes")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  sendResponse(
    res,
    200,
    httpStatusText.SUCCESS,
    "Successful fetching created videos",
    videos
  );
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const userInfo = req.userInfo;
  const userId = req.params.userId;
  const query = req.query;

  const limit = query?.limit || 10;
  const page = query?.page || 1;
  const skip = (page - 1) * limit;

  if (userInfo.userId !== userId) {
    return sendResponse(res, 403, httpStatusText.FAIL, "Forbidden", null);
  }

  const user = await UserModel.findById(userId)
    .select("likedVideos")
    .populate({
      path: "likedVideos",
      select: "-likes",
      options: {
        skip: skip,
        limit: limit,
      },
      populate: {
        path: "creator",
        select: "_id name email avatarUrl",
      },
    });

  if (!user) {
    return sendResponse(
      res,
      404,
      httpStatusText.FAIL,
      `User with id ${userId} not found`,
      null
    );
  }

  sendResponse(
    res,
    200,
    httpStatusText.SUCCESS,
    "Successful fetching liked videos",
    user.likedVideos
  );
});

const getSavedVideos = asyncHandler(async (req, res) => {
  const userInfo = req.userInfo;
  const userId = req.params.userId;
  const query = req.query;

  const limit = query?.limit || 10;
  const page = query?.page || 1;
  const skip = (page - 1) * limit;

  if (userInfo.userId !== userId) {
    return sendResponse(res, 403, httpStatusText.FAIL, "Forbidden", null);
  }

  const user = await UserModel.findById(userId)
    .select("savedVideos")
    .populate({
      path: "savedVideos",
      select: "-likes",
      options: {
        skip: skip,
        limit: limit,
      },
      populate: {
        path: "creator",
        select: "_id name email avatarUrl",
      },
    });

  if (!user) {
    return sendResponse(
      res,
      404,
      httpStatusText.FAIL,
      `User with id ${userId} not found`,
      null
    );
  }

  sendResponse(
    res,
    200,
    httpStatusText.SUCCESS,
    "Successful fetching saved videos",
    user.savedVideos
  );
});

const getCreatedComments = asyncHandler(async (req, res) => {
  const userInfo = req.userInfo;
  const userId = req.params.userId;
  const query = req.query;

  const limit = query?.limit || 20;
  const page = query?.page || 1;
  const skip = (page - 1) * limit;

  if (userInfo.userId !== userId) {
    return sendResponse(res, 403, httpStatusText.FAIL, "Forbidden", null);
  }

  const createdComments = await CommentModel.find({ creator: userId })
    .skip(skip)
    .limit(limit)
    .populate({
      path: "creator",
      select: "-subscribers -subscriptions -likedVideos -savedVideos -password",
    })
    .populate({
      path: "video",
      select: "-likes",
    })
    .sort({ updatedAt: -1 });

  sendResponse(
    res,
    200,
    httpStatusText.SUCCESS,
    "Successful fetching created comments",
    createdComments
  );
});

module.exports = {
  getUsers,
  searchUsers,
  getSuggestedUsers,
  getUser,
  updateUser,
  deleteUser,
  getSubscribers,
  IsUserSubscriber,
  removeSubscriber,
  getSubscriptions,
  IsUserSubscribed,
  subscribe,
  unsubscribe,
  getNotifications,
  getNotification,
  updateNotification,
  deleteNotification,
  getCreatedVideos,
  getLikedVideos,
  getSavedVideos,
  getCreatedComments,
};
