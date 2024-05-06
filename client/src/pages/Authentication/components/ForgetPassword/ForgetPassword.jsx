/* eslint-disable react/prop-types */
import { useRef, useState, useEffect } from "react";
import { MoonLoader } from "react-spinners";
import axios from "../../../../api/axios";
import style from "./ForgetPassword.module.css";

const ForgetPassword = ({ setPage }) => {
  const emailRef = useRef(null);
  const errRef = useRef(null);
  const successRef = useRef(null);

  const [email, setEmail] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [forgetPasswordLoad, setForgetPasswordLoad] = useState(false);

  useEffect(() => {
    emailRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
    setSuccessMsg("");
  }, [email]);

  const forgetPassword = async (e) => {
    e.preventDefault();

    try {
      setForgetPasswordLoad(true);

      const res = await axios.post(
        `/auth/forgetPassword`,
        {
          email: email,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      setSuccessMsg(res.data.message);
      successRef.current.focus();
    } catch (err) {
      if (!err?.response) setErrMsg("No Server Response");
      const message = err.response?.data?.message;
      message
        ? setErrMsg(message)
        : setErrMsg("Forget Password Process Failed");
      errRef.current.focus();
    } finally {
      setForgetPasswordLoad(false);
    }
  };

  return (
    <form className={style.forget_password_form} onSubmit={forgetPassword}>
      <h2>Forget Password</h2>

      <div ref={errRef} aria-live="assertive">
        {errMsg && <p className={style.error_message}>{errMsg}</p>}
      </div>

      <div ref={successRef} aria-live="assertive">
        {successMsg && <p className={style.success_message}>{successMsg}</p>}
      </div>

      <input
        type="email"
        ref={emailRef}
        autoComplete="off"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
        value={email}
        required
      />

      <button
        type="submit"
        disabled={forgetPasswordLoad ? true : false}
        style={forgetPasswordLoad ? { opacity: 0.5, cursor: "revert" } : {}}
      >
        <span>Submit</span>
        {forgetPasswordLoad && <MoonLoader color="#000" size={15} />}
      </button>

      <div className={style.controllers}>
        <button type="button" onClick={() => setPage("login")}>
          Login
        </button>

        <button type="button" onClick={() => setPage("register")}>
          Register
        </button>
      </div>
    </form>
  );
};

export default ForgetPassword;
