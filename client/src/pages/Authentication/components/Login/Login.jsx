/* eslint-disable react/prop-types */
import { useRef, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { MoonLoader } from "react-spinners";
import { useNotify } from "../../../../hooks";
import { setUser } from "../../../../store/slices/userSlice";
import axios from "../../../../api/axios";
import style from "./Login.module.css";

const Login = ({ setPage }) => {
  const user = useSelector((state) => state.user);

  const emailRef = useRef(null);
  const errRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const [loginLoad, setLoginLoad] = useState(false);

  const dispatch = useDispatch();
  const notify = useNotify();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    emailRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [email, password]);

  const togglePersist = () => {
    dispatch(setUser({ ...user, persist: !user?.persist }));
  };

  useEffect(() => {
    localStorage.setItem("persist", user?.persist);
  }, [user?.persist]);

  const login = async (e) => {
    e.preventDefault();

    try {
      setLoginLoad(true);

      const res = await axios.post(
        `/auth/login`,
        {
          email: email,
          password: password,
        },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      dispatch(setUser({ ...user, ...res.data.data }));
      notify("success", res.data.message);

      navigate(from, { replace: true });
    } catch (err) {
      if (!err?.response) setErrMsg("No Server Response");
      const message = err.response?.data?.message;
      message ? setErrMsg(message) : setErrMsg("Login Process Failed");
      errRef.current.focus();
    } finally {
      setLoginLoad(false);
    }
  };

  return (
    <form className={style.login_form} onSubmit={login}>
      <h2>Login</h2>

      <div ref={errRef} aria-live="assertive">
        {errMsg && <p className={style.error_message}>{errMsg}</p>}
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

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        value={password}
        required
      />

      <div className={style.persistCheck}>
        <input
          type="checkbox"
          id="persist"
          onChange={togglePersist}
          checked={user?.persist}
        />
        <label htmlFor="persist">Remember Me</label>
      </div>

      <button
        type="submit"
        disabled={loginLoad ? true : false}
        style={loginLoad ? { opacity: 0.5, cursor: "revert" } : {}}
      >
        <span>Login</span>
        {loginLoad && <MoonLoader color="#000" size={15} />}
      </button>

      <div className={style.controllers}>
        <button type="button" onClick={() => setPage("register")}>
          Register
        </button>

        <button type="button" onClick={() => setPage("forgetPassword")}>
          Forget Password
        </button>
      </div>
    </form>
  );
};

export default Login;
