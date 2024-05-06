/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { PuffLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { useAxiosPrivate, useHandleErrors, useNotify } from "../../../../hooks";
import ROLES_LIST from "../../../../utils/roles_list";
import defaultAvatar from "../../../../assets/defaultAvatar.png";
import style from "./UserCard.module.css";

const UserCard = ({ userData, users, setUsers }) => {
  const [deleteLoading, setDeleteLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();
  const notify = useNotify();

  const deleteUser = async (userId) => {
    try {
      setDeleteLoading(true);
      await axiosPrivate.delete(`users/${userId}`);
      setUsers(users.filter((item) => item._id !== userId));
      notify("success", "User account is deleted");
    } catch (err) {
      handleErrors(err);
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className={style.user_card}>
      <img src={userData.avatarUrl || defaultAvatar} alt="" loading="lazy" />

      <Link to={`/users/${userData._id}`} className={style.name}>
        {userData.name}
      </Link>

      <p className={style.email}>{userData.email}</p>

      <p className={style.roles}>
        Roles: {userData.roles.includes(ROLES_LIST.User) && <span>user</span>}
        {userData.roles.includes(ROLES_LIST.Editor) && <span>, editor</span>}
        {userData.roles.includes(ROLES_LIST.Admin) && <span>, admin</span>}
      </p>

      {!userData.isVerified ? (
        <p className={style.not_verified}>Not Verified</p>
      ) : (
        ""
      )}

      <button
        type="button"
        title="delete this user"
        className={style.delete_user_btn}
        onClick={() => deleteUser(userData._id)}
        disabled={deleteLoading ? true : false}
        style={deleteLoading ? { opacity: 0.5, cursor: "revert" } : {}}
      >
        {deleteLoading ? (
          <PuffLoader color="#000" size={20} />
        ) : (
          <FontAwesomeIcon icon={faTrashCan} />
        )}
      </button>
    </div>
  );
};

export default UserCard;
