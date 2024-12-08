import { Bookmark, MessageCircle, MoreHorizontal, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { FaRegHeart } from "react-icons/fa";
import CommentDialog from "./CommentDialog";
import { useState } from "react";
function Post() {
  const [text, setText] = useState("");
  const changeEventHandler = (e) => {
    const inputText = e.target.value;
    if (inputText.trim()) {
      setText(inputText);
    } else {
      setText("");
    }
  };
  return (
    <div className="my-8  w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src="" alt="post-img" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <h1>username</h1>
        </div>
        <Dialog>
          <DialogTrigger>
            <MoreHorizontal className="cursor-pointer" />
          </DialogTrigger>
          <DialogContent className="flex flex-col  text-center text-sm">
            <Button
              variant="ghost"
              className="w-fit cursor-pointer font-bold text-[#ED4956] "
            >
              Unfollow
            </Button>
            <Button variant="ghost" className="w-fit cursor-pointer">
              Add to Favourites
            </Button>
            <Button variant="ghost" className="w-fit cursor-pointer ">
              Delete
            </Button>
          </DialogContent>
        </Dialog>
      </div>
      <img
        src=""
        alt="post-img"
        className="rounded-sm my-2 w-full aspect-sqaure object-cover "
      />
      <div className="flex items-center justify-between my-2 ">
        {" "}
        <div className="flex items-center gap-3 ">
          <FaRegHeart
            size={"22px"}
            className="cursor-pointer hover:text-gray-600"
          />
          <MessageCircle className="cursor-pointer hover:text-gray-600" />
          <Send className="cursor-pointer hover:text-gray-600" />
        </div>
        <Bookmark className="cursor-pointer hover:text-gray-600" />
      </div>
      <span className="font-medium block mb-2">1k likes</span>
      <p className="">
        <span className="font-medium mr-2"> username</span>
        caption
      </p>
      <span>view all 10 comments.</span>
      <CommentDialog />
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Add a comment..."
          className="outline-none text-sm w-full"
          value={text}
          onChange={changeEventHandler}
        />
        {text && <span className="text-[#3BADF8]">Post</span>}
      </div>
    </div>
  );
}
export default Post;
