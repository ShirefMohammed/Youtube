const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refresh,
  logout,
  verifyAccount,
  forgetPassword,
  sendResetPasswordForm,
  resetPassword,
} = require("../controllers/authController");

router.route("/register").post(register);

router.route("/login").post(login);

router.route("/refresh").get(refresh);

router.route("/logout").get(logout);

router.route("/verifyAccount").get(verifyAccount);

router.route("/forgetPassword").post(forgetPassword);

router.route("/resetPassword").get(sendResetPasswordForm).post(resetPassword);

module.exports = router;
