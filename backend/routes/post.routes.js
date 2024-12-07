import express from "express";
import isAauthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import {
  addComment,
  addNewPost,
  bookmarkPost,
  deletePost,
  disLikePost,
  getAllPost,
  getCommentsOfPost,
  getUserPost,
  likePost,
} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/userpost/all", isAauthenticated, getUserPost);
router.get("/all", isAauthenticated, getAllPost);
router.get("/:id/like", isAauthenticated, likePost);
router.get("/:id/dislike", isAauthenticated, disLikePost);

router.post("/:id/comment", isAauthenticated, addComment);
router.post("/:id/comment/all", isAauthenticated, getCommentsOfPost);
router.delete("/delete/:id", isAauthenticated, deletePost);
router.post("/:id/bookmark", isAauthenticated, bookmarkPost);
router.post("/addpost", isAauthenticated, upload.single("image"), addNewPost);

export default router;
