const allowedOrigins = require("../config/allowedOrigins");
const sendResponse = require("../utils/sendResponse");

const handleCors = (req, res, next) => {
  if (
    allowedOrigins.includes(req.headers.origin) ||
    process.env.NODE_ENV === "development"
  ) {
    next();
  } else {
    sendResponse(res, 403, httpStatusText.FAIL, "Not allowed by CORS", null);
  }
};

module.exports = handleCors;
