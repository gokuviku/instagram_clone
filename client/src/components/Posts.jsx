import Post from "./Post";

function Posts() {
  return (
    <div>
      {[1, 2, 3].map((item, index) => (
        <Post key={index} />
      ))}
    </div>
  );
}
export default Posts;
