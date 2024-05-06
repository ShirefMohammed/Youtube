const UserModel = require("../models/userModel");

const handleUnverifiedAccounts = async () => {
  const users = await UserModel.find({ isVerified: false }, "_id createdAt");

  users.forEach(async (user) => {
    if (user.createdAt > Date.now() + 24 * 60 * 60 * 1000) {
      await UserModel.deleteOne({ _id: user._id });
    }
  });
};

module.exports = handleUnverifiedAccounts;
