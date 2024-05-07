const jwt = require("jsonwebtoken");

const generateResetPasswordToken = (userId) => {
  return jwt.sign({ userId: userId }, process.env.RESETPASSWORD_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

module.exports = generateResetPasswordToken;
