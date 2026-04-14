import { useContext, useState } from "react";
import "./stories.scss";
import { AuthContext } from "../../context/authContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";

const Stories = () => {
  const { currentUser } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const [uploading, setUploading] = useState(false);

  // ✅ FETCH STORIES
  const { isLoading, error, data: stories = [] } = useQuery({
    queryKey: ["stories"],
    queryFn: () =>
      makeRequest.get("/stories").then((res) => res.data),
  });

  // ✅ ADD STORY
  const addMutation = useMutation({
    mutationFn: (newStory) =>
      makeRequest.post("/stories", newStory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });

  // ✅ AUTO UPLOAD
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await makeRequest.post("/upload", formData);
      const imgUrl = uploadRes.data;

      addMutation.mutate({
        img: imgUrl,
      });

    } catch (err) {
      console.log(err);
    } finally {
      setUploading(false);
    }
  };

  // ✅ IMAGE HELPER
  const getImgPath = (img) => {
    if (!img) return "";
    return img.startsWith("http") ? img : "/upload/" + img;
  };

  return (
    <div className="stories">

      {/* ➕ ADD STORY */}
      <div className="story" style={{ minWidth: "150px", flexShrink: 0 }}>
        <img src={getImgPath(currentUser.profilePic)} alt="" />
        <span>{currentUser.name}</span>

        <input
          type="file"
          id="storyFile"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <label htmlFor="storyFile">
          <button>+</button>
        </label>

        {uploading && <span>Uploading...</span>}
      </div>

      {/* 📦 STORIES */}
      {error ? (
        "Something went wrong"
      ) : isLoading ? (
        "Loading..."
      ) : (
        stories.map((story) => (
          <div
            className="story"
            key={story.id}
            style={{ minWidth: "150px", flexShrink: 0 }}
          >
            <img src={getImgPath(story.img)} alt="" />
            <span>{story.name}</span>
          </div>
        ))
      )}
    </div>
  );
};

export default Stories;