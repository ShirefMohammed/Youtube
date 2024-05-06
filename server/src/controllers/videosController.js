const mongoose = require("mongoose");
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

const getVideos = asyncHandler(async (req, res) => {
  const query = req.query;

  const limit = query?.limit || 10;
  const page = query?.page || 1;
  const skip = (page - 1) * limit;

  const sort = query?.sort || -1;

  const videos = await VideoModel.find()
    .skip(skip)
    .limit(limit)
    .select("-likes")
    .populate({
      path: "creator",
      select: "_id name email avatarUrl roles",
    })
    .sort({ createdAt: sort });

  sendResponse(
    res,
    200,
    httpStatusText.SUCCESS,
    "successful fetching videos",
    videos
  );
});

const getSuggestedVideos = asyncHandler(async (req, res) => {
  const query = req.query;

  const limit = query?.limit || 10;
  const page = query?.page || 1;
  const skip = (page - 1) * limit;

  const sort = query?.sort || -1;

  const videos = await VideoModel.find()
    .skip(skip)
    .limit(limit)
    .select("-likes")
    .populate({
      path: "creator",
      select: "_id name email avatarUrl",
    })
    .sort({ createdAt: sort });

  sendResponse(
    res,
    200,
    httpStatusText.SUCCESS,
    "successful fetching videos",
    videos
  );
});

const getExploredVideos = asyncHandler(async (req, res) => {
  const exceptedVideos = req.query?.exceptedVideos
    ? req.query.exceptedVideos.split(",")
    : [];

  const limit = +req.query?.limit || 10;

  const videos = await VideoModel.aggregate([
    {
      $match: {
        _id: {
          $nin: exceptedVideos.map((id) => new mongoose.Types.ObjectId(id)),
        },
      },
    },
    { $sample: { size: limit } },
    {
      $lookup: {
        from: "users",
        localField: "creator",
        foreignField: "_id",
        as: "creator",
      },
    },
    { $unwind: "$creator" },
    {
      $project: {
        _id: 1,
        title: 1,
        desc: 1,
        thumbnailUrl: 1,
        videoUrl: 1,
        viewsNumber: 1,
        likesNumber: 1,
        createdAt: 1,
        updatedAt: 1,
        "creator._id": 1,
        "creator.name": 1,
        "creator.email": 1,
        "creator.avatarUrl": 1,
      },
    },
  ]);

  sendResponse(
    res,
    200,
    httpStatusText.SUCCESS,
    "successful fetching videos",
    videos
  );
});

const getTrendingVideos = asyncHandler(async (req, res) => {
  const query = req.query;

  const limit = query?.limit || 10;
  const page = query?.page || 1;
  const skip = (page - 1) * limit;

  const videos = await VideoModel.find()
    .skip(skip)
    .limit(limit)
    .select("-likes")
    .populate({
      path: "creator",
      select: "_id name email avatarUrl",
    })
    .sort({ viewsNumber: -1, _id: -1 });

  sendResponse(
    res,
    200,
    httpStatusText.SUCCESS,
    "successful fetching videos",
    videos
  );
});

const getSubscriptionVideos = asyncHandler(async (req, res) => {
  const userId = req.userInfo.userId;
  const query = req.query;

  const user = await UserModel.findById(userId).select("_id subscriptions");

  const limit = query?.limit || 10;
  const page = query?.page || 1;
  const skip = (page - 1) * limit;

  const sort = query?.sort || -1;

  const videos = await VideoModel.find({ creator: { $in: user.subscriptions } })
    .skip(skip)
    .limit(limit)
    .select("-likes")
    .populate({
      path: "creator",
      select: "_id name email avatarUrl",
    })
    .sort({ createdAt: sort });

  sendResponse(
    res,
    200,
    httpStatusText.SUCCESS,
    "successful fetching videos",
    videos
  );
});

const searchVideos = asyncHandler(async (req, res) => {
  const query = req.query;

  const limit = query?.limit || 10;
  const page = query?.page || 1;
  const skip = (page - 1) * limit;

  const videos = await VideoModel.find(
    { title: { $regex: query?.searchKey, $options: "i" } },
    "-likes"
  )
    .populate({
      path: "creator",
      select: "_id name email avatarUrl roles",
    })
    .skip(skip)
    .limit(limit);

  sendResponse(
    res,
    200,
    httpStatusText.SUCCESS,
    "Successful fetching videos",
    videos
  );
});

const createVideo = asyncHandler(async (req, res) => {
  const creatorId = req.userInfo.userId;
  const { title, desc, thumbnailUrl, videoUrl } = req.body;

  const IsCreatorExist = await UserModel.exists({ _id: creatorId });

  if (!IsCreatorExist) {
    return sendResponse(
      res,
      404,
      httpStatusText.FAIL,
      "Creator does not exist",
      null
    );
  }

  if (!title || !thumbnailUrl || !videoUrl) {
    return sendResponse(
      res,
      400,
      httpStatusText.FAIL,
      "title, thumbnailUrl and videoUrl are required",
      null
    );
  }

  if (title.length > 150) {
    return sendResponse(
      res,
      400,
      httpStatusText.FAIL,
      "Max length of title is 150 character",
      null
    );
  }

  if (!(await checkIfExistsInFirebase(thumbnailUrl))) {
    return sendResponse(
      res,
      400,
      httpStatusText.FAIL,
      "Invalid thumbnailUrl",
      null
    );
  }

  if (!(await checkIfExistsInFirebase(videoUrl))) {
    return sendResponse(
      res,
      400,
      httpStatusText.FAIL,
      "Invalid videoUrl",
      null
    );
  }

  const newVideo = await VideoModel.create({
    creator: creatorId,
    title: title,
    desc: desc,
    thumbnailUrl: thumbnailUrl,
    videoUrl: videoUrl,
  });

  sendResponse(res, 201, httpStatusText.SUCCESS, "Video is created", newVideo);
});

const getVideo = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;

  const video = await VideoModel.findById(videoId)
    .populate({ path: "creator", select: "_id name email avatarUrl" })
    .select("-likes");

  if (!video) {
    return sendResponse(
      res,
      404,
      httpStatusText.FAIL,
      `Video with Id {${videoId}} not found`,
      null
    );
  }

  video.viewsNumber = video.viewsNumber + 1;
  await video.save();

  sendResponse(
    res,
    200,
    httpStatusText.SUCCESS,
    "successful fetching video",
    video
  );
});

const updateVideo = asyncHandler(async (req, res) => {
  const userInfo = req.userInfo;
  const videoId = req.params.videoId;
  const { desc, thumbnailUrl } = req.body;

  const video = await VideoModel.findById(videoId).select(
    "_id creator thumbnailUrl"
  );

  if (!video) {
    return sendResponse(
      res,
      404,
      httpStatusText.FAIL,
      `Video with Id {${videoId}} not found`,
      null
    );
  }

  if (userInfo.userId != video.creator) {
    return sendResponse(
      res,
      403,
      httpStatusText.FAIL,
      "You don't have permissions to update this video",
      null
    );
  }

  if (thumbnailUrl && !(await checkIfExistsInFirebase(thumbnailUrl))) {
    return sendResponse(
      res,
      400,
      httpStatusText.FAIL,
      "Invalid thumbnailUrl",
      null
    );
  }

  let updatedFields = {};

  if (thumbnailUrl) {
    await deleteFromFirebase(video.thumbnailUrl);
    updatedFields.thumbnailUrl = thumbnailUrl;
  }

  if (desc) {
    updatedFields.desc = desc;
  }

  const updatedVideo = await VideoModel.findByIdAndUpdate(
    videoId,
    updatedFields,
    { new: true }
  );

  sendResponse(
    res,
    200,
    httpStatusText.SUCCESS,
    "Video is updated",
    updatedVideo
  );
});

const deleteVideo = asyncHandler(async (req, res) => {
  const userInfo = req.userInfo;
  const videoId = req.params.videoId;

  const video = await VideoModel.findById(videoId).select(
    "_id creator thumbnailUrl videoUrl"
  );

  if (!video) {
    return sendResponse(
      res,
      404,
      httpStatusText.FAIL,
      `Video with Id {${videoId}} not found`,
      null
    );
  }

  if (
    !userInfo.roles.includes(ROLES_LIST.Admin) &&
    userInfo.userId != video.creator
  ) {
    return sendResponse(
      res,
      403,
      httpStatusText.FAIL,
      "You don't have permissions to delete this video",
      null
    );
  }

  // Delete all notifications about comments on this video
  const videoComments = CommentModel.find({ video: videoId }, "_id");
  const commentIds = videoComments.map((comment) => comment._id);
  await NotificationModel.deleteMany({ comment: { $in: commentIds } });

  // Delete all video comments
  await CommentModel.deleteMany({ video: videoId });

  // Delete thumbnailUrl from firebase
  await deleteFromFirebase(video.thumbnailUrl);

  // Delete videoUrl from firebase
  await deleteFromFirebase(video.videoUrl);

  // Delete this video
  await video.deleteOne();

  sendResponse(res, 204, httpStatusText.SUCCESS, "", null);
});

const isVideoLiked = asyncHandler(async (req, res) => {
  const userId = req.userInfo.userId;
  const videoId = req.params.videoId;

  const isVideoLiked = await UserModel.exists({
    _id: userId,
    likedVideos: videoId,
  });

  sendResponse(res, 200, httpStatusText.SUCCESS, "", Boolean(isVideoLiked));
});

const likeVideo = asyncHandler(async (req, res) => {
  const userId = req.userInfo.userId;
  const videoId = req.params.videoId;

  const user = await UserModel.findById(userId, "likedVideos");

  if (!user) {
    return sendResponse(
      res,
      404,
      httpStatusText.FAIL,
      `User with Id ${userId} Not Found`,
      null
    );
  }

  const video = await VideoModel.findById(videoId, "likes likesNumber");

  if (!video) {
    return sendResponse(
      res,
      404,
      httpStatusText.FAIL,
      `Video with Id {${videoId}} not found`,
      null
    );
  }

  if (!video.likes.includes(userId)) {
    video.likes.push(userId);
    video.likesNumber = video.likesNumber + 1;
    await video.save();
  }

  if (!user.likedVideos.includes(videoId)) {
    user.likedVideos.push(videoId);
    await user.save();
  }

  sendResponse(res, 200, httpStatusText.SUCCESS, "Video is liked", true);
});

const unLikeVideo = asyncHandler(async (req, res) => {
  const userId = req.userInfo.userId;
  const videoId = req.params.videoId;

  const user = await UserModel.findById(userId, "likedVideos");

  if (!user) {
    return sendResponse(
      res,
      404,
      httpStatusText.FAIL,
      `User with Id ${userId} Not Found`,
      null
    );
  }

  const video = await VideoModel.findById(videoId, "likes likesNumber");

  if (!video) {
    return sendResponse(
      res,
      404,
      httpStatusText.FAIL,
      `Video with Id {${videoId}} not found`,
      null
    );
  }

  video.likes = video.likes.filter((id) => id != userId);
  video.likesNumber = video.likes.length;
  await video.save();

  user.likedVideos = user.likedVideos.filter((id) => id != videoId);
  await user.save();

  sendResponse(res, 204, httpStatusText.SUCCESS, "", null);
});

const isVideoSaved = asyncHandler(async (req, res) => {
  const userId = req.userInfo.userId;
  const videoId = req.params.videoId;

  const isVideoSaved = await UserModel.exists({
    _id: userId,
    savedVideos: videoId,
  });

  sendResponse(res, 200, httpStatusText.SUCCESS, "", Boolean(isVideoSaved));
});

const saveVideo = asyncHandler(async (req, res) => {
  const userId = req.userInfo.userId;
  const videoId = req.params.videoId;

  const user = await UserModel.findById(userId, "savedVideos");

  if (!user) {
    return sendResponse(
      res,
      404,
      httpStatusText.FAIL,
      `User with Id ${userId} Not Found`,
      null
    );
  }

  const isVideoExists = await VideoModel.exists({ _id: videoId });

  if (!isVideoExists) {
    return sendResponse(
      res,
      404,
      httpStatusText.FAIL,
      `Video with Id {${videoId}} not found`,
      null
    );
  }

  if (!user.savedVideos.includes(videoId)) {
    user.savedVideos.push(videoId);
    await user.save();
  }

  sendResponse(res, 200, httpStatusText.SUCCESS, "Video is saved", true);
});

const unsaveVideo = asyncHandler(async (req, res) => {
  const userId = req.userInfo.userId;
  const videoId = req.params.videoId;

  const user = await UserModel.findById(userId, "savedVideos");

  if (!user) {
    return sendResponse(
      res,
      404,
      httpStatusText.FAIL,
      `User with Id ${userId} Not Found`,
      null
    );
  }

  const isVideoExists = await VideoModel.exists({ _id: videoId });

  if (!isVideoExists) {
    return sendResponse(
      res,
      404,
      httpStatusText.FAIL,
      `Video with Id {${videoId}} not found`,
      null
    );
  }

  user.savedVideos = user.savedVideos.filter((id) => id != videoId);
  await user.save();

  sendResponse(res, 204, httpStatusText.SUCCESS, "", null);
});

const getVideoComments = asyncHandler(async (req, res) => {
  const videoId = req.params.videoId;
  const query = req.query;

  const limit = query?.limit || 10;
  const page = query?.page || 1;
  const skip = (page - 1) * limit;

  const sort = query?.sort || 1;

  const comments = await CommentModel.find({ video: videoId })
    .skip(skip)
    .limit(limit)
    .populate({
      path: "creator",
      select: "_id name email avatarUrl",
    })
    .populate({
      path: "video",
      select: "_id creator",
    })
    .sort({ createdAt: sort });

  sendResponse(
    res,
    200,
    httpStatusText.SUCCESS,
    "successful fetching video comments",
    comments
  );
});

const addVideoComment = asyncHandler(async (req, res) => {
  const userId = req.userInfo.userId;
  const videoId = req.params.videoId;
  const content = req.body.content;

  if (!content) {
    return sendResponse(
      res,
      400,
      httpStatusText.FAIL,
      `Comment content required`,
      null
    );
  }

  const IsVideoExists = await VideoModel.exists({ _id: videoId });

  if (!IsVideoExists) {
    return sendResponse(
      res,
      404,
      httpStatusText.FAIL,
      `Video with Id ${videoId} Not Found`,
      null
    );
  }

  const IsUserExists = await UserModel.exists({ _id: userId });

  if (!IsUserExists) {
    return sendResponse(
      res,
      404,
      httpStatusText.FAIL,
      `User with Id ${userId} Not Found`,
      null
    );
  }

  const newComment = await CommentModel.create({
    creator: userId,
    video: videoId,
    content: content,
  });

  // Populate the 'newComment.creator' field
  await newComment.populate({
    path: "creator",
    select: "_id name email avatarUrl",
  });

  // Populate the 'newComment.video' field
  await newComment.populate({
    path: "video",
    select: "_id creator",
  });

  // Create NEW_COMMENT notification
  const newNotification = await NotificationModel.create({
    sender: newComment.creator._id,
    receiver: newComment.video.creator,
    type: NOTIFICATIONS_TYPES_LIST.NEW_COMMENT,
    comment: newComment._id,
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

  // Populate the 'newNotification.comment' field
  await newNotification.populate({
    path: "comment",
  });

  sendResponse(res, 201, httpStatusText.SUCCESS, "Comment is created", {
    comment: newComment,
    notification: newNotification,
  });
});

const updateVideoComment = asyncHandler(async (req, res) => {
  const userId = req.userInfo.userId;
  const videoId = req?.params.videoId;
  const commentId = req.params.commentId;
  const content = req.body.content;

  if (!content) {
    return sendResponse(
      res,
      400,
      httpStatusText.FAIL,
      `Comment content required`,
      null
    );
  }

  const comment = await CommentModel.findById(commentId)
    .populate({
      path: "creator",
      select: "_id name email avatarUrl",
    })
    .populate({
      path: "video",
      select: "_id creator",
    });

  if (!comment) {
    return sendResponse(
      res,
      404,
      httpStatusText.FAIL,
      `Comment not found`,
      null
    );
  }

  if (userId != comment.creator._id || videoId != comment.video._id) {
    return sendResponse(res, 403, httpStatusText.FAIL, `Forbidden`, null);
  }

  comment.content = content;
  await comment.save();

  sendResponse(res, 200, httpStatusText.SUCCESS, "Comment is updated", comment);
});

const deleteVideoComment = asyncHandler(async (req, res) => {
  const userInfo = req.userInfo;
  const commentId = req.params.commentId;

  const comment = await CommentModel.findById(commentId).populate({
    path: "video",
    select: "_id creator",
  });

  if (!comment) {
    return sendResponse(
      res,
      404,
      httpStatusText.FAIL,
      `Comment not found`,
      null
    );
  }

  if (
    userInfo.userId != comment.creator &&
    userInfo.userId != comment.video.creator &&
    !userInfo.roles.includes(ROLES_LIST.Admin)
  ) {
    return sendResponse(res, 403, httpStatusText.FAIL, `Forbidden`, null);
  }

  // Delete comment notification
  await NotificationModel.deleteOne({ comment: comment._id });

  // Delete this comment
  await comment.deleteOne();

  sendResponse(res, 204, httpStatusText.SUCCESS, "", null);
});

module.exports = {
  getVideos,
  getSuggestedVideos,
  getExploredVideos,
  getTrendingVideos,
  getSubscriptionVideos,
  searchVideos,
  createVideo,
  getVideo,
  updateVideo,
  deleteVideo,
  isVideoLiked,
  likeVideo,
  unLikeVideo,
  isVideoSaved,
  saveVideo,
  unsaveVideo,
  getVideoComments,
  addVideoComment,
  updateVideoComment,
  deleteVideoComment,
};
