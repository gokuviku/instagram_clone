import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/dataUri.js";
import cloudinary from "../utils/cloudinary.js";
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res
        .status(401)
        .json({ message: "Please fill in all fields", success: false });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res
        .status(401)
        .json({ message: "Email already exists", success: false });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hashedPassword });
    return res
      .status(201)
      .json({ message: "Account created successfully.", success: true });
  } catch (error) {
    console.log(error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(401)
        .json({ message: "Please fill in all fields", success: false });
    }
    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "User not exists", success: false });
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }
    user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: user.posts,
    };
    const token = await jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "Strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .json({ message: `welcome back ${user.username}`, success: true, user });
  } catch (error) {
    console.log(error);
  }
};

export const logout = async (_, res) => {
  try {
    return res.cookie("token", "", { maxAge: 0 }).json({
      message: "logged out successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getProfile = async (req, res) => {
  try {
    const { userId } = req.params.id;
    const user = await User.findById(userId).select("-password");
    return res.status(200).json({ user, success: true });
  } catch (error) {
    console.log(error);
  }
};

export const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { bio, gender } = req.body;
    const { profilePicture } = req.file;
    let cloudResponse;
    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    if (bio) user, (bio = bio);
    if (gender) user.gender = gender;
    if (profilePicture) user.profilePicture = cloudResponse.secure_url;
    await user.save();
    return res
      .status(200)
      .json({ message: "Profile updated.", success: true, user });
  } catch (error) {
    console.log(error);
  }
};

export const getSuggestedUser = async (req, res) => {
  try {
    const suggestedUsers = await User.find({ id: { $ne: req.id } }).select(
      "-password"
    );
    if (!suggestedUsers) {
      return res.status(400).json({
        message: "No users found",
      });
    }
    return res.status(200).json({ users: suggestedUsers, success: true });
  } catch (error) {
    console.log(error);
  }
};

export const followOrUnfollow = async (req, res) => {
  try {
    const followKarneWala = req.id; //patel
    const jiskoFollowKarunga = req.params.id; // shivani
    if (followKarneWala === jiskoFollowKarunga) {
      return res
        .status(400)
        .json({ message: "You can't follow yourself", success: false });
    }
    const user = await User.findById(followKarneWala);
    const targetUser = await User.findById(jiskoFollowKarunga);

    if (!user || !targetUser) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    //check if already following
    const isFollowing = user.following.includes(jiskoFollowKarunga);
    if (isFollowing) {
      //unfollow
      await Promise.all([
        user.updateOne(
          { id: followKarneWala },
          { $pull: { following: jiskoFollowKarunga } }
        ),
        user.updateOne(
          { id: jiskoFollowKarunga },
          { $pull: { followers: followKarneWala } }
        ),
      ]);
      return res.status(200).json({
        message: "unfollowed successfully",
        success: true,
      });
    } else {
      //follow
      await Promise.all([
        user.updateOne(
          { id: followKarneWala },
          { $push: { following: jiskoFollowKarunga } }
        ),
        user.updateOne(
          { id: jiskoFollowKarunga },
          { $push: { followers: followKarneWala } }
        ),
      ]);
      return res.status(200).json({
        message: "followed successfully",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
  }
};