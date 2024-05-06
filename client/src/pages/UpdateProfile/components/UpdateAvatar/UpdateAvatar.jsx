/* eslint-disable react/prop-types */
import { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../../../store/slices/userSlice";
import { useAxiosPrivate } from "../../../../hooks";
import handleImageQuality from "../../../../utils/handleImageQuality";
import uploadFileToFirebase from "../../../../utils/uploadFileToFirebase";
import defaultAvatar from "../../../../assets/defaultAvatar.png";
import style from "./UpdateAvatar.module.css";

const UpdateAvatar = ({ userData }) => {
  const user = useSelector((state) => state.user);

  const errRef = useRef(null);
  const successRef = useRef(null);

  const [avatarUrl, setAvatarUrl] = useState(userData?.avatarUrl);
  const [uploadAvatarProgress, setUploadAvatarProgress] = useState(0);

  const [errMsg, setErrMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const axiosPrivate = useAxiosPrivate();
  const dispatch = useDispatch();

  const ChangeAvatar = async (newAvatar) => {
    try {
      if (!newAvatar) return null;

      const resizedAvatarFile = await handleImageQuality(
        newAvatar,
        225,
        225,
        80
      );

      let uploadedAvatarUrl = await uploadFileToFirebase(
        resizedAvatarFile,
        "avatar",
        setUploadAvatarProgress
      );

      const res = await axiosPrivate.patch(
        `users/${userData._id}`,
        { avatarUrl: uploadedAvatarUrl },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      setAvatarUrl(res.data.data.avatarUrl);
      dispatch(setUser({ ...user, avatarUrl: res.data.data.avatarUrl }));

      setSuccessMsg("Avatar is changed successfully");
      successRef.current.focus();
    } catch (err) {
      if (!err?.response) setErrMsg("No Server Response");
      const message = err.response?.data?.message;
      message ? setErrMsg(message) : setErrMsg("Update is Failed");
      errRef.current.focus();
    }
  };

  return (
    <form className={style.update_avatar}>
      {/* Title */}
      <h3>Change Avatar</h3>

      {/* Error Message */}
      <div ref={errRef} aria-live="assertive">
        {errMsg && <p className={style.error_message}>{errMsg}</p>}
      </div>

      {/* Success Message */}
      <div ref={successRef} aria-live="assertive">
        {successMsg && <p className={style.success_message}>{successMsg}</p>}
      </div>

      {/* Avatar */}
      <div className={style.avatar}>
        <img src={avatarUrl || defaultAvatar} alt="" />
        <input
          type="file"
          id="avatarFileInput"
          accept="image/*"
          multiple={false}
          aria-describedby="avatarFileNote"
          onChange={(e) => ChangeAvatar(e.target.files[0])}
        />
        <span className={style.upload_avatar_progress}>
          {uploadAvatarProgress}%
        </span>
      </div>
    </form>
  );
};

export default UpdateAvatar;
