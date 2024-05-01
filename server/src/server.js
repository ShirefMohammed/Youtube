const express = require("express");
const dotenv = require("dotenv");
const path = require("node:path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/connectDB");
const authRouter = require("./routes/authRouter");
const usersRouter = require("./routes/usersRouter");
const videosRouter = require("./routes/videosRouter");
const handleCors = require("./middleware/handleCors");
const handleErrors = require("./middleware/errorHandler");

// Use environment variables
dotenv.config();

// Create server
const app = express();
const _PORT = process.env.PORT;

// Connect to mongo database
connectDB();

// Cross Origin Resource Sharing
app.use(handleCors, cors(corsOptions));

// Built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// Built-in middleware for json
app.use(express.json());

// Middleware for cookies
app.use(cookieParser());

// Routes
app.get("/", (_, res) =>
  res.sendFile(path.join(__dirname, "views", "index.html"))
);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/videos", videosRouter);

// Handle not found routes
app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

// Ping the server every 14 minutes for render platform
setInterval(() => {
  fetch(process.env.SERVER_URL)
    .then((res) => {
      if (res.ok) {
        console.log("Server ping successful");
      } else {
        console.error("Server ping failed:", res.status);
      }
    })
    .catch((error) => {
      console.error("Error pinging server:", error);
    });
}, 840000);

// Handle error middleware
app.use(handleErrors);

// Listen for requests
app.listen(_PORT, () => {
  console.log(`Server running on ${process.env.SERVER_URL} for port ${_PORT}`);
});
