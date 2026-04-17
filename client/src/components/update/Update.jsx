import { useState } from "react";
import { makeRequest } from "../../axios";
import "./update.scss";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const Update = ({ setOpenUpdate, user }) => {
  const [cover, setCover] = useState(null);
  const [profile, setProfile] = useState(null);

  const [texts, setTexts] = useState({
    email: user.email || "",
    password: "", // Leave blank by default for security
    name: user.name || "",
    city: user.city || "",
    website: user.website || "",
  });

  const upload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest.post("/upload", formData);
      return res.data; // Should return the filename
    } catch (err) {
      console.log("Upload error:", err);
    }
  };

  const handleChange = (e) => {
    setTexts((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (updatedUser) => makeRequest.put("/users", updatedUser),
    onSuccess: () => {
      // Invalidate the specific user to force a refresh on the Profile page
      queryClient.invalidateQueries({ queryKey: ["user", user.id] });
    },
  });

  const handleClick = async (e) => {
    e.preventDefault();

    // If a new file is selected, upload it. Otherwise, keep the old URL/Path.
    let coverUrl = cover ? await upload(cover) : user.coverPic;
    let profileUrl = profile ? await upload(profile) : user.profilePic;

    mutation.mutate({
      ...texts,
      coverPic: coverUrl,
      profilePic: profileUrl,
    });

    setOpenUpdate(false);
    setCover(null);
    setProfile(null);
  };

  // Helper to handle image previews correctly (Handles Pexels URLs)
  const getPreviewImage = (file, existingPic) => {
    if (file) return URL.createObjectURL(file);
    if (!existingPic) return "";
    return existingPic.includes("http") 
      ? existingPic 
      : "http://localhost:8800/upload/" + existingPic;
  };

  return (
    <div className="update">
      <div className="wrapper">
        <h1>Update Your Profile</h1>
        <form>
          <div className="files">
            {/* COVER PICTURE */}
            <label htmlFor="cover">
              <span>Cover Picture</span>
              <div className="imgContainer">
                <img src={getPreviewImage(cover, user.coverPic)} alt="Cover Preview" />
                <CloudUploadIcon className="icon" />
              </div>
            </label>
            <input
              type="file"
              id="cover"
              style={{ display: "none" }}
              onChange={(e) => setCover(e.target.files[0])}
            />

            {/* PROFILE PICTURE */}
            <label htmlFor="profile">
              <span>Profile Picture</span>
              <div className="imgContainer">
                <img src={getPreviewImage(profile, user.profilePic)} alt="Profile Preview" />
                <CloudUploadIcon className="icon" />
              </div>
            </label>
            <input
              type="file"
              id="profile"
              style={{ display: "none" }}
              onChange={(e) => setProfile(e.target.files[0])}
            />
          </div>

          <label>Email</label>
          <input type="email" value={texts.email} name="email" onChange={handleChange} />

          <label>Password (Leave blank to keep current)</label>
          <input type="password" name="password" onChange={handleChange} />

          <label>Name</label>
          <input type="text" value={texts.name} name="name" onChange={handleChange} />

          <label>City</label>
          <input type="text" name="city" value={texts.city} onChange={handleChange} />

          <label>Website</label>
          <input type="text" name="website" value={texts.website} onChange={handleChange} />

          <button onClick={handleClick} disabled={mutation.isPending}>
            {mutation.isPending ? "Updating..." : "Update"}
          </button>
        </form>
        <button className="close" onClick={() => setOpenUpdate(false)}>close</button>
      </div>
    </div>
  );
};

export default Update;