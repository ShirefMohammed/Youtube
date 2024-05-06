import { useEffect, useState } from "react";
import { Navigate, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { MoonLoader } from "react-spinners";
import UpdateUserInfo from "./components/UpdateUserInfo/UpdateUserInfo";
import UpdateAvatar from "./components/UpdateAvatar/UpdateAvatar";
import UpdatePassword from "./components/UpdatePassword/UpdatePassword";
import DeleteAccount from "./components/DeleteAccount/DeleteAccount";
import { useHandleErrors } from "../../hooks";
import axios from "../../api/axios";
import style from "./UpdateProfile.module.css";

const UpdateProfile = () => {
  const { userId } = useParams(); // general user id - profile id
  const user = useSelector((state) => state.user); // current user - visitor

  const [userData, setUserData] = useState({});
  const [fetchUserLoad, setFetchUserLoad] = useState(false);

  const handleErrors = useHandleErrors();
  const location = useLocation();

  // Fetch current profile data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setFetchUserLoad(true);
        const res = await axios.get(`/users/${userId}`);
        setUserData(res.data.data);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchUserLoad(false);
      }
    };

    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  return (
    <>
      {fetchUserLoad ? (
        <div className={style.loading_container}>
          <MoonLoader color="#000" size={20} />
        </div>
      ) : userData?._id === user._id ? (
        <div className={style.update_profile}>
          <h2>Update My Profile</h2>

          <div className={style.update_user_info_section}>
            <UpdateUserInfo userData={userData} />
          </div>

          <div className={style.update_avatar_section}>
            <UpdateAvatar userData={userData} />
          </div>

          <div className={style.update_password_section}>
            <UpdatePassword />
          </div>

          <div className={style.delete_account_section}>
            <DeleteAccount />
          </div>
        </div>
      ) : userData?._id && userData._id !== user._id ? (
        <Navigate to="/unauthorized" state={{ from: location }} replace />
      ) : (
        ""
      )}
    </>
  );
};

export default UpdateProfile;
