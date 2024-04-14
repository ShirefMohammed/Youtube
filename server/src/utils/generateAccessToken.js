const jwt = require("jsonwebtoken");

const generateAccessToken = (userId, roles) => {
  return jwt.sign(
    {
      userInfo: {
        userId: userId,
        roles: roles,
      },
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" }
  );
};

module.exports = generateAccessToken;
