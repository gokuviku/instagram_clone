import dotenv from "dotenv";
import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./utils/connectDB.js";
dotenv.config();

import userRoutes from "./routes/user.routes.js";
import messageRoutes from "./routes/message.routes.js";
import postRoutes from "./routes/post.routes.js";

const app = express();
app.get("/", (req, res) => {
  res.send("Hello World");
});
const port = process.env.PORT || 6000;
//midllewares
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

app.use("/users", userRoutes);
app.use("/posts", postRoutes);
app.use("/message", messageRoutes);

app.listen(() => {
  connectDB();
  console.log(`server is running on port ${port}`);
});
