/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import defaultAvatar from "../../assets/defaultAvatar.png";
import style from "./UserCard.module.css";

const UserCard = ({ user }) => {
  return (
    <div className={style.user_card}>
      <Link to={`/users/${user._id}`}>
        <img src={user.avatarUrl || defaultAvatar} alt="" />
        <span>{user.name}</span>
      </Link>
    </div>
  );
};

export default UserCard;
