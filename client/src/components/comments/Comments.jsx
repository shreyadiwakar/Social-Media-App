import { useContext, useState } from "react";
import "./comments.scss";
import { AuthContext } from "../../context/authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import moment from "moment";

const Comments = ({ postId }) => {
  const [desc, setDesc] = useState("");
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  // ✅ FIXED: unique query per post
  const { isLoading, error, data = [] } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () =>
      makeRequest.get("/comments?postId=" + postId).then((res) => res.data),
  });

  // ✅ FIXED: mutation v5
  const mutation = useMutation({
    mutationFn: (newComment) =>
      makeRequest.post("/comments", newComment),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  const handleClick = (e) => {
    e.preventDefault();
    if (!desc.trim()) return;
    mutation.mutate({ desc, postId });
    setDesc("");
  };

  return (
    <div className="comments">
      <div className="write">
        {/* ✅ FIXED IMAGE URL */}
        <img
          src={
            currentUser.profilePic
              ? currentUser.profilePic
              : "/upload/default.png"
          }
          alt=""
        />

        <input
          type="text"
          placeholder="write a comment"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        <button onClick={handleClick}>Send</button>
      </div>

      {error
        ? "Something went wrong"
        : isLoading
        ? "loading"
        : data.map((comment) => (
            <div className="comment" key={comment.id}>
              
              {/* ✅ FIXED IMAGE URL */}
              <img
                src={
                  comment.profilePic
                    ? comment.profilePic
                    : "/upload/default.png"
                }
                alt=""
              />

              <div className="info">
                <span>{comment.name}</span>
                <p>{comment.desc}</p>
              </div>

              <span className="date">
                {moment(comment.createdAt).fromNow()}
              </span>
            </div>
          ))}
    </div>
  );
};

export default Comments;