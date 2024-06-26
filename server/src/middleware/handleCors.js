const allowedOrigins = require("../config/allowedOrigins");
const httpStatusText = require("../utils/httpStatusText");
const sendResponse = require("../utils/sendResponse");

const handleCors = (req, res, next) => {
  if (
    allowedOrigins.includes(req.headers.origin) ||
    process.env.NODE_ENV === "development" ||
    req.url === "/" ||
    req.url.startsWith("/api/auth/verifyAccount") ||
    req.url.startsWith("/api/auth/resetPassword")
  ) {
    next();
  } else {
    sendResponse(res, 403, httpStatusText.FAIL, "Not allowed by CORS", null);
  }
};

module.exports = handleCors;
