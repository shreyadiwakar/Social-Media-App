import "./leftBar.scss";
import Friends from "../../assets/1.png";
import Gallery from "../../assets/8.png";
import { AuthContext } from "../../context/authContext";
import { useContext } from "react";

const LeftBar = () => {

  const { currentUser } = useContext(AuthContext);

  return (
    <div className="leftBar">
      <div className="container">
        <div className="menu">
          <div className="user">
            <a href={`/profile/${currentUser.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <img
                src={currentUser.profilePic}
                alt=""
              />
              <span>{currentUser.name}</span>
            </a>
          </div>
          <div className="item">
            <a href={`/`} style={{ textDecoration: "none", color: "inherit" }}>
              <img src={Gallery} alt="" />
              <span>Posts</span>
            </a>
            
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default LeftBar;
