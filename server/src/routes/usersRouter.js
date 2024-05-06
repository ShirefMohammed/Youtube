const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");
const verifyRoles = require("../middleware/verifyRoles");
const ROLES_LIST = require("../utils/roles_list");
const {
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
} = require("../controllers/usersController");

router.route("/").get(verifyJWT, verifyRoles([ROLES_LIST.Admin]), getUsers);

router.route("/search").get(searchUsers);

router.route("/suggest").get(verifyJWT, getSuggestedUsers);

router
  .route("/:userId")
  .get(getUser)
  .patch(verifyJWT, updateUser)
  .delete(verifyJWT, deleteUser);

router.route("/:userId/subscribers").get(getSubscribers);

router
  .route("/:userId/subscribers/:targetUserId")
  .get(IsUserSubscriber)
  .delete(verifyJWT, removeSubscriber);

router.route("/:userId/subscriptions").get(getSubscriptions);

router
  .route("/:userId/subscriptions/:targetUserId")
  .get(IsUserSubscribed)
  .patch(verifyJWT, subscribe)
  .delete(verifyJWT, unsubscribe);

router.route("/:userId/notifications").get(verifyJWT, getNotifications);

router
  .route("/:userId/notifications/:notificationId")
  .get(verifyJWT, getNotification)
  .patch(verifyJWT, updateNotification)
  .delete(verifyJWT, deleteNotification);

router.route("/:userId/createdVideos").get(getCreatedVideos);

router.route("/:userId/likedVideos").get(verifyJWT, getLikedVideos);

router.route("/:userId/savedVideos").get(verifyJWT, getSavedVideos);

router.route("/:userId/createdComments").get(verifyJWT, getCreatedComments);

module.exports = router;

// Routes Constraints

// getUsers, users, admins or editors is only available for admin
// searchUsers users is available for all
// getSuggestedUsers users is available for verified users

// getUser is available for all
// updateUser is only available for account owner
// deleteUser is available for both account owner and admin

// getSubscribers is available for all
// IsUserSubscriber is available for all
// removeSubscriber is only available for account owner

// getSubscriptions is available for all
// IsUserSubscribed is available for all
// subscribe is available for verified users
// unsubscribe is only available for account owner

// getNotifications is available for receiver
// getNotification is available for receiver
// updateNotification is available for receiver
// deleteNotification is available for receiver

// getCreatedVideos is available for all
// getLikedVideos is available for account owner
// getSavedVideos is available for account owner
// getCreatedComments is available for account owner
