/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import { faGauge, faGear } from "@fortawesome/free-solid-svg-icons";
import ROLES_LIST from "../../../../utils/roles_list";
import style from "./ProfileControllers.module.css";

const ProfileControllers = ({ userId, setOpenDeleteAccount }) => {
  const user = useSelector((state) => state.user); // current user - visitor

  return (
    <nav className={style.profile_controllers}>
      {/* Delete Account Button */}
      {user?._id === userId || user?.roles?.includes(ROLES_LIST.Admin) ? (
        <button
          type="button"
          title="delete the account"
          onClick={() => setOpenDeleteAccount(true)}
        >
          <FontAwesomeIcon icon={faTrashAlt} />
        </button>
      ) : (
        ""
      )}

      {/* Update Account Link */}
      {user?._id === userId ? (
        <Link to={`/users/${userId}/update`} title="update my profile">
          <FontAwesomeIcon icon={faPenToSquare} />
        </Link>
      ) : (
        ""
      )}

      {/* Account Settings Link */}
      {user?._id === userId ? (
        <Link to={`/settings`} title="settings">
          <FontAwesomeIcon icon={faGear} />
        </Link>
      ) : (
        ""
      )}

      {/* Admin Dashboard Link */}
      {user?._id === userId && user?.roles?.includes(ROLES_LIST.Admin) ? (
        <Link to={`/adminDashboard`} title="admin dashboard">
          <FontAwesomeIcon icon={faGauge} />
        </Link>
      ) : (
        ""
      )}
    </nav>
  );
};

export default ProfileControllers;
