const express = require("express");
const router = express.Router();
const ROLES_LIST = require("../utils/roles_list");
const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require("../middleware/verifyRoles");
const {
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
} = require("../controllers/videosController");

router
  .route("/")
  .get(verifyJWT, verifyRoles([ROLES_LIST.Admin]), getVideos)
  .post(verifyJWT, createVideo);

router.route("/suggest").get(getSuggestedVideos);

router.route("/explore").get(getExploredVideos);

router.route("/trending").get(getTrendingVideos);

router.route("/subscriptions").get(verifyJWT, getSubscriptionVideos);

router.route("/search").get(searchVideos);

router
  .route("/:videoId")
  .get(getVideo)
  .patch(verifyJWT, updateVideo)
  .delete(verifyJWT, deleteVideo);

router
  .route("/:videoId/likes")
  .get(verifyJWT, isVideoLiked)
  .patch(verifyJWT, likeVideo)
  .delete(verifyJWT, unLikeVideo);

router
  .route("/:videoId/save")
  .get(verifyJWT, isVideoSaved)
  .patch(verifyJWT, saveVideo)
  .delete(verifyJWT, unsaveVideo);

router
  .route("/:videoId/comments")
  .get(getVideoComments)
  .post(verifyJWT, addVideoComment);

router
  .route("/:videoId/comments/:commentId")
  .patch(verifyJWT, updateVideoComment)
  .delete(verifyJWT, deleteVideoComment);

module.exports = router;

// Routes Constraints

// getVideos is only available for admin
// createVideo is only available for verified user

// getSuggestedVideos is available for all
// getExploredVideos is available for all
// getTrendingVideos is available for all
// getSubscriptionVideos is only available for verified user

// getVideo is available for all
// updateVideo is only available for video creator
// deleteVideo is available for video creator and admin

// isVideoLiked is only available for verified user
// likeVideo is only available for verified user
// unlikeVideo is only available for verified user

// isVideoSaved is only available for verified user
// saveVideo is only available for verified user
// unsaveVideo is only available for verified user

// getVideoComments is available for all
// addVideoComment is only available for verified user

// updateVideoComment is only available for comment creator
// deleteVideoComment is available for comment creator, video creator and admin
