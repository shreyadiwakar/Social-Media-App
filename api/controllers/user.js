import { db } from "../connect.js";
import jwt from "jsonwebtoken";

export const getUser = (req, res) => {
  const userId = req.params.userId;
  const q = "SELECT * FROM users WHERE id=?";

  db.query(q, [userId], (err, data) => {
    if (err) return res.status(500).json(err);
    const { password, ...info } = data[0];
    return res.json(info);
  });
};
import bcrypt from "bcryptjs";

export const updateUser = (req, res) => {
  const token = req.cookies.accessToken;
  if (!token) return res.status(401).json("Not authenticated!");

  jwt.verify(token, "secretkey", (err, userInfo) => {
    if (err) return res.status(403).json("Token is not valid!");

    // 1. Check if a new password was actually provided
    let hashedPassword = null;
    if (req.body.password && req.body.password.trim() !== "") {
      const salt = bcrypt.genSaltSync(10);
      hashedPassword = bcrypt.hashSync(req.body.password, salt);
    }

    // 2. Build a dynamic query or ensure the current one handles the password
    // If hashedPassword exists, we update it. If not, we keep the old one.
    const q = hashedPassword 
      ? "UPDATE users SET `name`=?, `city`=?, `website`=?, `profilePic`=?, `coverPic`=?, `email`=?, `password`=? WHERE id=?"
      : "UPDATE users SET `name`=?, `city`=?, `website`=?, `profilePic`=?, `coverPic`=?, `email`=? WHERE id=?";

    const values = hashedPassword
      ? [req.body.name, req.body.city, req.body.website, req.body.profilePic, req.body.coverPic, req.body.email, hashedPassword, userInfo.id]
      : [req.body.name, req.body.city, req.body.website, req.body.profilePic, req.body.coverPic, req.body.email, userInfo.id];

    db.query(q, values, (err, data) => {
      if (err) return res.status(500).json(err);
      if (data.affectedRows > 0) return res.json("Updated!");
      return res.status(403).json("You can update only your account!");
    });
  });
};