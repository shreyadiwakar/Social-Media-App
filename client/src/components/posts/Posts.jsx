import Post from "../post/Post";
import "./posts.scss";
import { useQuery } from "@tanstack/react-query";
import { makeRequest } from "../../axios";

const Posts = ({ userId }) => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["posts", userId],

    queryFn: async () => {
      const res = await makeRequest.get("/posts", {
        params: userId ? { userId } : {},
      });
      return res.data;
    },
  });
  console.log(data);

  return (
    <div className="posts">
      {error ? (
        "Something went wrong!"
      ) : isLoading ? (
        "Loading..."
      ) : data?.length ? (
        data.map((post) => <Post post={post} key={post.id} />)
      ) : (
        "No posts found"
      )}
    </div>
  );
};

export default Posts;