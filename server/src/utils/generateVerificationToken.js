const jwt = require("jsonwebtoken");

const generateVerificationToken = (userId) => {
  return jwt.sign({ userId: userId }, process.env.VERIFICATION_TOKEN_SECRET, {
    expiresIn: "15m",
  });
};

module.exports = generateVerificationToken;
