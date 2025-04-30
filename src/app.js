const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors=require("cors");
require("dotenv").config(); 
//require("./utils/cronjobs");
const http=require("http");

connectDB();
app.use(cors({
  origin:"http://localhost:5173",
  credentials:true,
}))
app.use(express.json());
app.use(cookieParser()); 

const authRouter=require("./routes/auth");
const profileRouter=require("./routes/profile");
const requestRouter=require("./routes/request");
const userRouter = require("./routes/user");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chatRoutes");
const paymentRouter=require("./routes/payment");

app.use("/",authRouter);
app.use("/",profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", chatRouter);
app.use("/", paymentRouter);

const server=http.createServer(app);
initializeSocket(server);


connectDB()
  .then(() => {
    console.log("database is istablished...");
    server.listen(process.env.PORT,
    () => {
      console.log("server is successfully listening on port 7777 ");
    });
  })
  .catch((err) => {
    console.error("database is not established...");
  });
