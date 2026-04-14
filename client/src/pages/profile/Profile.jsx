import "./profile.scss";
import FacebookTwoToneIcon from "@mui/icons-material/FacebookTwoTone";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import PinterestIcon from "@mui/icons-material/Pinterest";
import TwitterIcon from "@mui/icons-material/Twitter";
import PlaceIcon from "@mui/icons-material/Place";
import LanguageIcon from "@mui/icons-material/Language";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Posts from "../../components/posts/Posts";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { useLocation } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import Update from "../../components/update/Update";

const Profile = () => {
  const [openUpdate, setOpenUpdate] = useState(false);
  const { currentUser } = useContext(AuthContext);

  const userId = parseInt(useLocation().pathname.split("/")[2]);
  const queryClient = useQueryClient();

  // ✅ FIXED user query
  const { isLoading, error, data } = useQuery({
    queryKey: ["user", userId],
    queryFn: () =>
      makeRequest.get("/users/find/" + userId).then((res) => res.data),
  });

  // ✅ FIXED relationship query
  const { isLoading: rIsLoading, data: relationshipData = [] } = useQuery({
    queryKey: ["relationship", userId],
    queryFn: () =>
      makeRequest
        .get("/relationships?followedUserId=" + userId)
        .then((res) => res.data),
  });

  // ✅ FIXED mutation
  const mutation = useMutation({
    mutationFn: (following) => {
      if (following)
        return makeRequest.delete("/relationships?userId=" + userId);
      return makeRequest.post("/relationships", { userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["relationship", userId] });
    },
  });

  const handleFollow = () => {
    mutation.mutate(relationshipData.includes(currentUser.id));
  };
  console.log("relationshipData", relationshipData);

  return (
    <div className="profile">
      {isLoading ? (
        "loading"
      ) : (
        <>
          <div className="images">

            {/* FIXED COVER IMAGE */}
            <img
              src={
                data.coverPic
              }
              alt=""
              className="cover"
            />

            {/* FIXED PROFILE IMAGE */}
            <img
              src={
                data.profilePic
              }
              alt=""
              className="profilePic"
            />
          </div>

          <div className="profileContainer">
            <div className="uInfo">
              <span>{data.name}</span>
              <div className="uInfoContainer">

                  <div className="info">
                    <div className="item">
                      <PlaceIcon />
                      <span>{data.city}</span>
                    </div>
                    <div className="item">
                      <a 
                      href={data.website}
                      target="_blank" 
                      rel="noreferrer"
                    >
                      <LanguageIcon />
                    </a>
                    </div>
                  </div>

                  {rIsLoading ? (
                    "loading"
                  ) : userId === currentUser.id ? (
                    <button onClick={() => setOpenUpdate(true)}>
                      update
                    </button>
                  ) : (
                    <button onClick={handleFollow}>
                      {relationshipData.includes(currentUser.id)
                        ? "Following"
                        : "Follow"}
                    </button>
                  )}
              </div>
              
            </div>

            <Posts userId={userId} />
          </div>
        </>
      )}

      {openUpdate && (
        <Update setOpenUpdate={setOpenUpdate} user={data} />
      )}
    </div>
  );
};

export default Profile;