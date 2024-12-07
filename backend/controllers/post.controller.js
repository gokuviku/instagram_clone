import sharp from "sharp";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Comment } from "../models/comment.model.js";
export const addNewPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const image = req.file;
    const authorId = req.authorId;
    if (!image) return res.status(400).json({ message: "image required." });
    //image upload
    const optimizedImageBuffer = await sharp(image.buffer)
      .resize({ width: 800, height: 800, fit: "inside" })
      .toFormat("jpeg", { quality: 80 })
      .toBuffer();

    //buffer to dataUri
    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString(
      "base64"
    )}`;
    const cloudRespone = await cloudinary.uploader.upload(fileUri);
    const post = await Post.create({
      caption,
      image: cloudRespone.secure_url,
      author: authorId,
    });
    const user = await User.findById(authorId);
    if (user) {
      user.posts.push(post._id);
      await user.save();
    }
    await post.populate({ path: "author", select: "-password" });
    return res
      .status(201)
      .json({ message: "new post added", success: true, post });
  } catch (error) {
    console.log(error);
  }
};

export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "auhtor", select: "username,profilePicture" })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: { path: "author", select: "username profilePicture" },
      });
    res.status(200).json({ posts, success: true });
  } catch (error) {
    console.log(error);
  }
};

export const getUserPost = async (req, res) => {
  try {
    const auhtorId = req.id;
    const posts = await Post.find({ author: auhtorId })
      .populate({
        path: "author",
        select: "username, profilePicture",
      })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: { path: "author", select: "username profilePicture" },
      });
    res.status(200).json({ posts, success: true });
  } catch (error) {
    console.log(error);
  }
};

export const likePost = async (req, res) => {
  try {
    const likeKarneWalaUserKiId = req.id;
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    if (!postId) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }
    //like logic
    await post.update({ $adToSet: { likes: likeKarneWalaUserKiId } });
    await post.save();

    //implementing socket io for realtime notification.
    return res.status(200).json({ message: "Post liked.", success: true });
  } catch (error) {
    console.log(error);
  }
};

export const disLikePost = async (req, res) => {
  try {
    const likeKarneWalaUserKiId = req.id;
    const postId = req.params.postId;
    const post = await Post.findById(postId);
    if (!postId) {
      return res
        .status(404)
        .json({ success: false, message: "Post not found." });
    }
    //like logic
    await post.update({ $pull: { likes: likeKarneWalaUserKiId } });
    await post.save();

    //implementing socket io for realtime notification.
    return res.status(200).json({ message: "Post disliked.", success: true });
  } catch (error) {
    console.log(error);
  }
};

export const addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const commentKrneWalaUserKiId = req.id;
    const { text } = req.body;
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(400)
        .json({ message: "text is required.", success: false });
    }
    const comment = Comment.create({
      text,
      author: commentKrneWalaUserKiId,
      post: postId,
    }).populate({ path: "author", select: "username,profilePicture" });
    post.comments.push(comment._id);
    await post.save();
    return res
      .status(201)
      .json({ comment, message: "Comment added.", success: true });
  } catch (error) {
    console.log(error);
  }
};

export const getCommentsOfPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const comments = await Comment.find({ post: postId }).populate(
      "author",
      "username,profilePicture"
    );

    if (!comments) {
      return res
        .status(404)
        .json({ message: "No comments found for this post", success: false });
    }
    return res.status(200).json({ success: true, comments });
  } catch (error) {
    console.log(error);
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ message: "post not found.", success: false });
    }
    //check if the logged-in user is the author of the post.
    if (post.author.toString() !== authorId) {
      return res
        .status(403)
        .json({ message: "You can't delete this post.", success: false });
    }
    //delete post
    await Post.findByIdAndDelete(postId);
    //remove post id from user post
    let user = await User.findByIdAndDelete(authorId);
    user.posts = user.posts.filter((id) => id.toString() !== postId);
    await user.save();

    //delete associated comments.
    await Comment.deleteMany({ post: postId });

    return res.status(200).json({ message: "post deleted.", success: true });
  } catch (error) {
    console.log(error);
  }
};

export const bookmarkPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(404)
        .json({ message: "post not found.", success: false });
    }
    const user = User.findById(authorId);
    if (user.bookmarks.includes(post._id)) {
      //already bookmarked -> remove from boobmark.
      await user.updateOne({ $pull: { bookmarks: post._id } });
      await user.save();
      res.status(200).json({
        type: "unsaved",
        message: "posst removed from bookmark.",
        success: true,
      });
    } else {
      //bookmark
      await user.updateOne({ $addToSet: { bookmarks: post._id } });
      await user.save();
      res.status(200).json({
        type: "saved",
        message: "posst added to bookmark.",
        success: true,
      });
    }
  } catch (error) {
    console.log(error);
  }
};
