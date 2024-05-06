import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { MoonLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTimes,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useAxiosPrivate } from "../../../../hooks";
import style from "./UpdatePassword.module.css";

// Regular expressions
const PASS_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

const UpdatePassword = () => {
  const { userId } = useParams();

  const errRef = useRef(null);
  const successRef = useRef(null);

  const [oldPassword, setOldPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [validNewPassword, setValidNewPassword] = useState(false);
  const [newPasswordFocus, setNewPasswordFocus] = useState(false);

  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [validConfirmNewPassword, setValidConfirmNewPassword] = useState(false);
  const [confirmNewPasswordFocus, setConfirmNewPasswordFocus] = useState(false);

  const [updateLoading, setUpdateLoading] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const axiosPrivate = useAxiosPrivate();

  // Reset error and success messages while changing oldPassword or newPassword
  useEffect(() => {
    setErrMsg("");
  }, [oldPassword, newPassword]);

  // Test valid passwords
  useEffect(() => {
    setValidNewPassword(PASS_REGEX.test(newPassword));
    setValidConfirmNewPassword(confirmNewPassword === newPassword);
  }, [newPassword, confirmNewPassword]);

  const changePassword = async (e) => {
    e.preventDefault();

    try {
      if (!oldPassword || !newPassword || !confirmNewPassword) {
        setErrMsg("All fields are required");
        errRef.current.focus();
        return null;
      }

      if (!PASS_REGEX.test(newPassword)) {
        setErrMsg("Invalid Password");
        errRef.current.focus();
        return null;
      }

      if (newPassword !== confirmNewPassword) {
        setErrMsg("confirm password must match password");
        errRef.current.focus();
        return;
      }

      setUpdateLoading(true);

      const res = await axiosPrivate.patch(`users/${userId}`, {
        oldPassword: oldPassword,
        newPassword: newPassword,
      });

      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");

      setSuccessMsg(res.data.message);
      successRef.current.focus();
    } catch (err) {
      if (!err?.response) setErrMsg("No Server Response");
      const message = err.response?.data?.message;
      message ? setErrMsg(message) : setErrMsg("Update is Failed");
      errRef.current.focus();
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <form className={style.update_password} onSubmit={changePassword}>
      {/* Title */}
      <h3>Change Password</h3>

      {/* Error Message */}
      <div ref={errRef} aria-live="assertive">
        {errMsg && <p className={style.error_message}>{errMsg}</p>}
      </div>

      {/* Success Message */}
      <div ref={successRef} aria-live="assertive">
        {successMsg && <p className={style.success_message}>{successMsg}</p>}
      </div>

      {/* Old Password */}
      <div>
        <label htmlFor="oldPassword">Old Password:</label>
        <input
          type="password"
          id="oldPassword"
          placeholder="Old Password"
          onChange={(e) => setOldPassword(e.target.value)}
          value={oldPassword}
        />
      </div>

      {/* New Password */}
      <div>
        <label htmlFor="newPassword">New Password:</label>
        <span className={style.check_mark}>
          {newPassword === "" ? (
            ""
          ) : validNewPassword ? (
            <FontAwesomeIcon icon={faCheck} className={style.valid} />
          ) : (
            <FontAwesomeIcon icon={faTimes} className={style.invalid} />
          )}
        </span>
        <input
          type="password"
          id="newPassword"
          placeholder="New Password"
          onChange={(e) => setNewPassword(e.target.value)}
          value={newPassword}
          required
          aria-invalid={validNewPassword ? "false" : "true"}
          aria-describedby="newPasswordNote"
          onFocus={() => setNewPasswordFocus(true)}
          onBlur={() => setNewPasswordFocus(false)}
        />
        {newPasswordFocus && !validNewPassword ? (
          <p id="newPasswordNote" className={style.instructions}>
            <FontAwesomeIcon icon={faInfoCircle} />
            8 to 24 characters.
            <br />
            Must include uppercase and lowercase letters , a number and a
            special character.
            <br />
            Allowed special characters:
            <span aria-label="exclamation mark"> ! </span>
            <span aria-label="at symbol">@ </span>
            <span aria-label="hashtag"># </span>
            <span aria-label="dollar sign">$ </span>
            <span aria-label="percent">% </span>
          </p>
        ) : (
          ""
        )}
      </div>

      {/* Confirm New Password */}
      <div>
        <label htmlFor="confirmNewPassword">Confirm New Password:</label>
        <span className={style.check_mark}>
          {confirmNewPassword === "" ? (
            ""
          ) : validConfirmNewPassword ? (
            <FontAwesomeIcon icon={faCheck} className={style.valid} />
          ) : (
            <FontAwesomeIcon icon={faTimes} className={style.invalid} />
          )}
        </span>
        <input
          type="password"
          id="confirmNewPassword"
          placeholder="Confirm New Password"
          onChange={(e) => setConfirmNewPassword(e.target.value)}
          value={confirmNewPassword}
          required
          aria-invalid={validConfirmNewPassword ? "false" : "true"}
          aria-describedby="confirmNote"
          onFocus={() => setConfirmNewPasswordFocus(true)}
          onBlur={() => setConfirmNewPasswordFocus(false)}
        />
        {confirmNewPasswordFocus &&
        confirmNewPassword &&
        !validConfirmNewPassword ? (
          <p id="confirmNote" className={style.instructions}>
            <FontAwesomeIcon icon={faInfoCircle} />
            Must match password field.
          </p>
        ) : (
          ""
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={
          updateLoading ||
          !oldPassword ||
          !validNewPassword ||
          !validConfirmNewPassword
            ? true
            : false
        }
        style={
          updateLoading ||
          !oldPassword ||
          !validNewPassword ||
          !validConfirmNewPassword
            ? { opacity: 0.5, cursor: "revert" }
            : {}
        }
      >
        <span>Change Password</span>
        {updateLoading && <MoonLoader color="#000" size={15} />}
      </button>
    </form>
  );
};

export default UpdatePassword;
