const path = require("node:path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../middleware/asyncHandler");
const UserModel = require("../models/userModel");
const httpStatusText = require("../utils/httpStatusText");
const generateAccessToken = require("../utils/generateAccessToken");
const generateRefreshToken = require("../utils/generateRefreshToken");
const generateVerificationToken = require("../utils/generateVerificationToken");
const generateResetPasswordToken = require("../utils/generateResetPasswordToken");
const sendResponse = require("../utils/sendResponse");
const checkIfExistsInFirebase = require("../utils/checkIfExistsInFirebase");
const sendVerificationEmail = require("../utils/sendVerificationEmail");
const sendResetPasswordEmail = require("../utils/sendResetPasswordEmail");

// Regular expressions
const NAME_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
const PASS_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

const register = asyncHandler(async (req, res) => {
  const { name, email, password, avatarUrl } = req.body;

  if (!name || !email || !password) {
    return sendResponse(
      res,
      400,
      httpStatusText.FAIL,
      "All fields are required",
      null
    );
  }

  if (!NAME_REGEX.test(name)) {
    return sendResponse(
      res,
      400,
      httpStatusText.FAIL,
      `Name must be 4 to 24 characters, Must begin with a letter, Letters, numbers, underscores, hyphens allowed, No spaces.`,
      null
    );
  }

  if (!EMAIL_REGEX.test(email)) {
    return sendResponse(
      res,
      400,
      httpStatusText.FAIL,
      `Enter valid email.`,
      null
    );
  }

  if (!PASS_REGEX.test(password)) {
    return sendResponse(
      res,
      400,
      httpStatusText.FAIL,
      `Password must be 8 to 24 characters, Must include uppercase and lowercase letters , a number and a special character, Allowed special characters: !, @, #, $, %`,
      null
    );
  }

  const user = await UserModel.findOne({ email: email }).select("_id");

  if (user) {
    return sendResponse(
      res,
      409,
      httpStatusText.FAIL,
      `User with same email already exists`,
      null
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await UserModel.create({
    name: name,
    email: email,
    password: hashedPassword,
    isVerified: false,
  });

  // Check If avatarUrl exists in firebase, if not set avatarUrl to default avatar
  const isAvatarExists = await checkIfExistsInFirebase(avatarUrl);

  if (isAvatarExists) {
    newUser.avatarUrl = avatarUrl;
    await newUser.save();
  }

  const verificationToken = generateVerificationToken(newUser._id);
  newUser.verificationToken = verificationToken;
  await newUser.save();

  await sendVerificationEmail(newUser.email, newUser.verificationToken);

  sendResponse(
    res,
    201,
    httpStatusText.SUCCESS,
    "Register succeeded, Check you email for verification link",
    null
  );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendResponse(
      res,
      400,
      httpStatusText.FAIL,
      "All fields are required",
      null
    );
  }

  const user = await UserModel.findOne({ email: email });

  if (!user) {
    return sendResponse(
      res,
      404,
      httpStatusText.FAIL,
      "User does not exist",
      null
    );
  }

  const IsPasswordMatch = await bcrypt.compare(password, user.password);

  if (!IsPasswordMatch) {
    return sendResponse(res, 401, httpStatusText.FAIL, "Wrong password", null);
  }

  if (!user.isVerified) {
    return sendResponse(
      res,
      401,
      httpStatusText.FAIL,
      "Your account is not verified",
      null
    );
  }

  const accessToken = generateAccessToken(user._id, user.roles);

  const refreshToken = generateRefreshToken(user._id);

  res.clearCookie("jwt", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });

  // Creates Secure Cookie with refreshToken
  res.cookie("jwt", refreshToken, {
    httpOnly: true, // accessible only by web server
    secure: true, // https
    sameSite: "None", // cross-site cookie
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  sendResponse(res, 200, httpStatusText.SUCCESS, "Login succeeded", {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    roles: user.roles,
    accessToken: accessToken,
  });
});

const refresh = asyncHandler(async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) {
    return sendResponse(res, 401, httpStatusText.FAIL, "Unauthorized", null);
  }

  res.clearCookie("jwt", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });

  jwt.verify(
    cookies.jwt,
    process.env.REFRESH_TOKEN_SECRET,
    async (err, decoded) => {
      if (err) {
        return sendResponse(
          res,
          403,
          httpStatusText.RefreshTokenExpiredError,
          "Forbidden",
          null
        );
      }

      const user = await UserModel.findById(decoded.userId);

      if (!user) {
        return sendResponse(
          res,
          404,
          httpStatusText.FAIL,
          "Account not found",
          null
        );
      }

      const accessToken = generateAccessToken(user._id, user.roles);

      const refreshToken = generateRefreshToken(user._id);

      // Creates Secure Cookie with refresh token
      res.cookie("jwt", refreshToken, {
        httpOnly: true, // accessible only by web server
        secure: true, // https
        sameSite: "None", // cross-site cookie
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      sendResponse(res, 200, httpStatusText.SUCCESS, `Refresh succeeded`, {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        roles: user.roles,
        accessToken: accessToken,
      });
    }
  );
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie("jwt", {
    httpOnly: true,
    secure: true,
    sameSite: "None",
  });

  return sendResponse(res, 204, httpStatusText.SUCCESS, "", null);
});

const verifyAccount = asyncHandler(async (req, res) => {
  const { verificationToken } = req.query;

  if (!verificationToken) {
    return res.status(400).send("Verification token is missing");
  }

  // Find the user by verification token
  const user = await UserModel.findOne({
    verificationToken: verificationToken,
  });

  if (!user) {
    return res.status(404).send("Invalid verification token");
  }

  try {
    // Verify the verification token asynchronously
    const decodedToken = await jwt.verify(
      verificationToken,
      process.env.VERIFICATION_TOKEN_SECRET
    );

    // Check if the decoded token contains the correct user ID
    if (decodedToken.userId !== user._id.toString()) {
      return res.status(409).send("Invalid verification token");
    }

    // Update user's verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return res
      .status(200)
      .sendFile(
        path.join(__dirname, "..", "views", "verification_confirmation.html")
      );
  } catch (error) {
    return res
      .status(403)
      .send(
        "Verification token has expired. Go to forget password page to generate a new verification token"
      );
  }
});

const forgetPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await UserModel.findOne({ email: email });

  if (!user) {
    return sendResponse(res, 404, httpStatusText.FAIL, "User not found", null);
  }

  const resetPasswordToken = generateResetPasswordToken(user._id);

  user.resetPasswordToken = resetPasswordToken;
  await user.save();

  sendResetPasswordEmail(email, resetPasswordToken);

  sendResponse(
    res,
    200,
    httpStatusText.SUCCESS,
    "Reset password email sent, check your email",
    null
  );
});

const sendResetPasswordForm = asyncHandler(async (req, res) => {
  const { resetPasswordToken } = req.query;

  if (!resetPasswordToken) {
    return res.status(400).send("Reset password token is missing");
  }

  const user = await UserModel.findOne({
    resetPasswordToken: resetPasswordToken,
  });

  if (!user) {
    return res.status(404).send("Invalid reset password token");
  }

  try {
    const decodedToken = await jwt.verify(
      resetPasswordToken,
      process.env.RESETPASSWORD_TOKEN_SECRET
    );

    // Check if the decoded token contains the correct user ID
    if (decodedToken.userId !== user._id.toString()) {
      return res.status(409).send("Invalid reset password token");
    }

    // Send reset password form
    return res
      .status(200)
      .sendFile(
        path.join(__dirname, "..", "views", "reset_password_form.html")
      );
  } catch (error) {
    return res
      .status(403)
      .send(
        "Reset password token has expired. Go to forget password page to generate a new reset password token"
      );
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { resetPasswordToken, newPassword } = req.body;

  const user = await UserModel.findOne({
    resetPasswordToken: resetPasswordToken,
  });

  if (!user) {
    return res.status(404).send("Invalid reset password token");
  }

  if (!PASS_REGEX.test(newPassword)) {
    return res
      .status(400)
      .send(
        "Password must be 8 to 24 characters, Must include uppercase and lowercase letters , a number and a special character, Allowed special characters: !, @, #, $, %"
      );
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetPasswordToken = undefined;
  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  res.status(200).send("Reset password succeeded, You can login now");
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  verifyAccount,
  forgetPassword,
  sendResetPasswordForm,
  resetPassword,
};
