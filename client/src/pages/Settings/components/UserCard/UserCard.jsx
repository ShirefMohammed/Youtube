/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { PuffLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useAxiosPrivate, useHandleErrors, useNotify } from "../../../../hooks";
import defaultAvatar from "../../../../assets/defaultAvatar.png";
import style from "./UserCard.module.css";

const UserCard = ({ userData, users, setUsers, removeUserType }) => {
  const user = useSelector((state) => state.user);

  const [removeLoading, setRemoveLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();
  const notify = useNotify();

  const handleRemove = (userId, channelId) => {
    if (removeUserType === "unsubscribe") {
      unsubscribe(userId, channelId);
    } else if (removeUserType === "removeSubscriber") {
      removeSubscriber(userId, channelId);
    }
  };

  const unsubscribe = async (userId, channelId) => {
    try {
      setRemoveLoading(true);
      await axiosPrivate.delete(`users/${userId}/subscriptions/${channelId}`);
      setUsers(users.filter((user) => user._id !== channelId));
      notify("success", "User is unsubscribed");
    } catch (err) {
      handleErrors(err);
    } finally {
      setRemoveLoading(false);
    }
  };

  const removeSubscriber = async (userId, channelId) => {
    try {
      setRemoveLoading(true);
      await axiosPrivate.delete(`users/${userId}/subscribers/${channelId}`);
      setUsers(users.filter((user) => user._id !== channelId));
      notify("success", "User is removed from subscribers");
    } catch (err) {
      handleErrors(err);
    } finally {
      setRemoveLoading(false);
    }
  };

  return (
    <div className={style.user_card}>
      <img src={userData.avatarUrl || defaultAvatar} alt="" loading="lazy" />

      <Link to={`/users/${userData._id}`} className={style.name}>
        {userData.name}
      </Link>

      <p className={style.email}>{userData.email}</p>

      <button
        type="button"
        title={
          removeUserType === "unsubscribe"
            ? "unsubscribe"
            : removeUserType === "removeSubscriber"
            ? "remove subscriber"
            : ""
        }
        className={style.remove_user_btn}
        onClick={() => handleRemove(user._id, userData._id)}
        disabled={removeLoading ? true : false}
        style={removeLoading ? { opacity: 0.5, cursor: "revert" } : {}}
      >
        {removeLoading ? (
          <PuffLoader color="#000" size={20} />
        ) : (
          <FontAwesomeIcon icon={faTrashCan} />
        )}
      </button>
    </div>
  );
};

export default UserCard;
