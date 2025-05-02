const express = require("express");
const connectDB = require("./config/database");
const path = require("path");  // Add this line to use path module
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const http = require("http");

connectDB();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// API routes
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chatRoutes");
const paymentRouter = require("./routes/payment");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);
app.use("/", paymentRouter);

// Serve React app
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client", "build")));  // Static files from React build folder

  // Any non-API route should return the React app's index.html for React Router to handle
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "client", "build", "index.html"));
  });
}

const server = http.createServer(app);
initializeSocket(server);

connectDB()
  .then(() => {
    console.log("Database is established...");
    server.listen(process.env.PORT, () => {
      console.log("Server is successfully listening on port 7777");
    });
  })
  .catch((err) => {
    console.error("Database is not established...");
  });

