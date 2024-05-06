/* eslint-disable react/prop-types */
import { useRef, useState, useEffect } from "react";
import { MoonLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTimes,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import handleImageQuality from "../../../../utils/handleImageQuality";
import uploadFileToFirebase from "../../../../utils/uploadFileToFirebase";
import axios from "../../../../api/axios";
import defaultAvatar from "../../../../assets/defaultAvatar.png";
import style from "./Register.module.css";

// Regular expressions
const NAME_REGEX = /^[A-z][A-z0-9-_]{3,23}$/;
const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
const PASS_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$/;

const Register = ({ setPage }) => {
  const nameRef = useRef(null);
  const errRef = useRef(null);
  const successRef = useRef(null);

  const [name, setName] = useState("");
  const [validName, setValidName] = useState(false);
  const [nameFocus, setNameFocus] = useState(false);

  const [email, setEmail] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [EmailFocus, setEmailFocus] = useState(false);

  const [password, setPassword] = useState("");
  const [validPassword, setValidPassword] = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [validConfirmPassword, setValidConfirmPassword] = useState(false);
  const [confirmPasswordFocus, setConfirmPasswordFocus] = useState(false);

  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadAvatarProgress, setUploadAvatarProgress] = useState(0);
  const [avatarHover, setAvatarHover] = useState(false);

  const [errMsg, setErrMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [registerLoad, setRegisterLoad] = useState(false);

  useEffect(() => {
    nameRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [name, email, password, confirmPassword]);

  useEffect(() => {
    setValidName(NAME_REGEX.test(name));
  }, [name]);

  useEffect(() => {
    setValidEmail(EMAIL_REGEX.test(email));
  }, [email]);

  useEffect(() => {
    setValidPassword(PASS_REGEX.test(password));
    setValidConfirmPassword(confirmPassword === password);
  }, [password, confirmPassword]);

  const register = async (e) => {
    e.preventDefault();

    try {
      // If buttons enabled with JS hack
      if (
        !NAME_REGEX.test(name) ||
        !EMAIL_REGEX.test(email) ||
        !PASS_REGEX.test(password)
      ) {
        setErrMsg("Invalid Entry");
        errRef.current.focus();
        return;
      }

      if (password !== confirmPassword) {
        setErrMsg("confirm password must match password");
        errRef.current.focus();
        return;
      }

      setRegisterLoad(true);

      // Upload avatar file to firebase storage
      let avatarUrl = null;

      if (avatarFile) {
        const resizedAvatarFile = await handleImageQuality(
          avatarFile,
          225,
          225,
          80
        );

        avatarUrl = await uploadFileToFirebase(
          resizedAvatarFile,
          "avatar",
          setUploadAvatarProgress
        );
      }

      // Create newUser and send request to the server
      const newUser = {
        name: name,
        email: email,
        password: password,
        avatarUrl: avatarUrl,
      };

      const res = await axios.post(`/auth/register`, newUser, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      // Empty states
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setAvatarFile("");
      setUploadAvatarProgress(0);
      document.getElementById("avatarFileInput").value = "";

      // Set success message
      setSuccessMsg(res.data.message);
      successRef.current.focus();
    } catch (err) {
      // If no server response
      if (!err?.response) setErrMsg("No Server Response");

      // If error message
      const message = err.response?.data?.message;
      message ? setErrMsg(message) : setErrMsg("Register Process Failed");
      errRef.current.focus();

      // Empty upload avatar progress state
      setUploadAvatarProgress(0);
    } finally {
      setRegisterLoad(false);
    }
  };

  return (
    <form className={style.register_form} onSubmit={register}>
      {/* Title */}
      <h2>Register</h2>

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
        <input
          type="text"
          autoComplete="off"
          placeholder="Name"
          onChange={(e) => setName(e.target.value)}
          value={name}
          required
          aria-invalid={!validName ? "true" : "false"}
          aria-describedby="nameNote"
          onFocus={() => setNameFocus(true)}
          onBlur={() => setNameFocus(false)}
          ref={nameRef}
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
        <span className={style.check_mark}>
          {email === "" ? (
            ""
          ) : validEmail ? (
            <FontAwesomeIcon icon={faCheck} className={style.valid} />
          ) : (
            <FontAwesomeIcon icon={faTimes} className={style.invalid} />
          )}
        </span>
        <input
          type="email"
          autoComplete="off"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          required
          aria-invalid={!validEmail ? "true" : "false"}
          aria-describedby="emailNote"
          onFocus={() => setEmailFocus(true)}
          onBlur={() => setEmailFocus(false)}
        />
        {EmailFocus && email && !validEmail ? (
          <p id="emailNote" className={style.instructions}>
            <FontAwesomeIcon icon={faInfoCircle} />
            Enter valid email, we will send verification token to your email.
          </p>
        ) : (
          ""
        )}
      </div>

      {/* Password */}
      <div>
        <span className={style.check_mark}>
          {password === "" ? (
            ""
          ) : validPassword ? (
            <FontAwesomeIcon icon={faCheck} className={style.valid} />
          ) : (
            <FontAwesomeIcon icon={faTimes} className={style.invalid} />
          )}
        </span>
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          required
          aria-invalid={validPassword ? "false" : "true"}
          aria-describedby="passwordNote"
          onFocus={() => setPasswordFocus(true)}
          onBlur={() => setPasswordFocus(false)}
        />
        {passwordFocus && !validPassword ? (
          <p id="passwordNote" className={style.instructions}>
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

      {/* Confirm Password */}
      <div>
        <span className={style.check_mark}>
          {confirmPassword === "" ? (
            ""
          ) : validConfirmPassword ? (
            <FontAwesomeIcon icon={faCheck} className={style.valid} />
          ) : (
            <FontAwesomeIcon icon={faTimes} className={style.invalid} />
          )}
        </span>
        <input
          type="password"
          placeholder="Confirm Password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          value={confirmPassword}
          required
          aria-invalid={validConfirmPassword ? "false" : "true"}
          aria-describedby="confirmPasswordNote"
          onFocus={() => setConfirmPasswordFocus(true)}
          onBlur={() => setConfirmPasswordFocus(false)}
        />
        {confirmPasswordFocus && !validConfirmPassword ? (
          <p id="confirmPasswordNote" className={style.instructions}>
            <FontAwesomeIcon icon={faInfoCircle} />
            Must match password field.
          </p>
        ) : (
          ""
        )}
      </div>

      {/* Upload Avatar */}
      <div className={style.avatar}>
        {avatarFile ? (
          <img src={URL.createObjectURL(avatarFile)} alt="" />
        ) : (
          <img src={defaultAvatar} alt="" />
        )}
        <input
          type="file"
          id="avatarFileInput"
          accept="image/*"
          multiple={false}
          aria-describedby="avatarFileNote"
          onChange={(e) => setAvatarFile(e.target.files[0])}
          onMouseEnter={() => setAvatarHover(true)}
          onMouseLeave={() => setAvatarHover(false)}
        />
        {avatarFile ? (
          <span className={style.upload_avatar_progress}>
            {uploadAvatarProgress}%
          </span>
        ) : (
          ""
        )}
        {avatarHover ? (
          <p id="avatarFileNote" className={style.instructions}>
            <FontAwesomeIcon icon={faInfoCircle} />
            Optional.
          </p>
        ) : (
          ""
        )}
      </div>

      {/* Submit Btn */}
      <button
        type="submit"
        disabled={registerLoad ? true : false}
        style={registerLoad ? { opacity: 0.5, cursor: "revert" } : {}}
      >
        <span>Register</span>
        {registerLoad && <MoonLoader color="#000" size={15} />}
      </button>

      {/* Controllers */}
      <div className={style.controllers}>
        <button type="button" onClick={() => setPage("login")}>
          Login
        </button>

        <button type="button" onClick={() => setPage("forgetPassword")}>
          Forget Password
        </button>
      </div>
    </form>
  );
};

export default Register;
