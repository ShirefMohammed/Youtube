/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { MoonLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTimes,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useAxiosPrivate } from "../../../../hooks";
import style from "./UpdateUserInfo.module.css";

// Regular expressions
const NAME_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;

const UpdateUserInfo = ({ userData }) => {
  const errRef = useRef(null);
  const successRef = useRef(null);

  const [name, setName] = useState(userData?.name || "");
  const [validName, setValidName] = useState(false);
  const [nameFocus, setNameFocus] = useState(false);

  const [email] = useState(userData?.email || "");

  const [updateLoading, setUpdateLoading] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const axiosPrivate = useAxiosPrivate();

  // Reset error and success messages while changing name
  useEffect(() => {
    setErrMsg("");
    setSuccessMsg("");
  }, [name]);

  // Test valid name
  useEffect(() => {
    setValidName(NAME_REGEX.test(name));
  }, [name]);

  // Update my profile information
  const sendUpdates = async (e) => {
    e.preventDefault();

    try {
      if (!NAME_REGEX.test(name)) {
        setErrMsg("Invalid Name");
        errRef.current.focus();
        return null;
      }

      setUpdateLoading(true);

      const res = await axiosPrivate.patch(`users/${userData._id}`, {
        name: name,
      });

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
    <form className={style.update_user_info} onSubmit={sendUpdates}>
      {/* Title */}
      <h3>Main Information</h3>

      {/* Error Message */}
      <div ref={errRef} aria-live="assertive">
        {errMsg && <p className={style.error_message}>{errMsg}</p>}
      </div>

      {/* Success Message */}
      <div ref={successRef} aria-live="assertive">
        {successMsg && <p className={style.success_message}>{successMsg}</p>}
      </div>

      {/* Name */}
      <div>
        <span className={style.check_mark}>
          {name === "" ? (
            ""
          ) : validName ? (
            <FontAwesomeIcon icon={faCheck} className={style.valid} />
          ) : (
            <FontAwesomeIcon icon={faTimes} className={style.invalid} />
          )}
        </span>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          autoComplete="off"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
          value={name}
          required
          aria-invalid={!validName ? "true" : "false"}
          aria-describedby="nameNote"
          onFocus={() => setNameFocus(true)}
          onBlur={() => setNameFocus(false)}
        />
        {nameFocus && name && !validName ? (
          <p id="nameNote" className={style.instructions}>
            <FontAwesomeIcon icon={faInfoCircle} />
            4 to 24 characters.
            <br />
            Must begin with a letter.
            <br />
            Letters, numbers, underscores, hyphens allowed.
            <br />
            No spaces.
          </p>
        ) : (
          ""
        )}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          autoComplete="off"
          placeholder="Email"
          value={email}
          readOnly={true}
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={updateLoading || name === userData?.name ? true : false}
        style={
          updateLoading || name === userData?.name
            ? { opacity: 0.5, cursor: "revert" }
            : {}
        }
      >
        <span>Save Updates</span>
        {updateLoading && <MoonLoader color="#000" size={15} />}
      </button>
    </form>
  );
};

export default UpdateUserInfo;
