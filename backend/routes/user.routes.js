import express from "express";
import {
  editProfile,
  followOrUnfollow,
  getProfile,
  getSuggestedUser,
  login,
  logout,
  register,
} from "../controllers/user.controller.js";
import isAauthenticated from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
const router = express.Router();

router.get("/:id/profile", isAauthenticated, getProfile);
router.post(
  "/profile/edit",
  isAauthenticated,
  upload.single("profilePicture"),
  editProfile
);
router.get("/suggested", isAauthenticated, getSuggestedUser);
router.post("/followorunfollowllow/:id", isAauthenticated, followOrUnfollow);

router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);

export default router;
