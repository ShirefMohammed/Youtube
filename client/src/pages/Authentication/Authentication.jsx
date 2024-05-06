import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useLogout } from "../../hooks";
import Login from "./components/Login/Login";
import Register from "./components/Register/Register";
import ForgetPassword from "./components/ForgetPassword/ForgetPassword";
import style from "./Authentication.module.css";

const Authentication = () => {
  const user = useSelector((state) => state.user);

  const [page, setPage] = useState("login");

  const navigate = useNavigate();
  const logout = useLogout();

  const goBack = () => navigate(-1);
  const goHome = () => navigate("/");

  return (
    <>
      {!user?.accessToken ? (
        <section className={style.authentication_page}>
          {page === "login" ? (
            <Login setPage={setPage} />
          ) : page === "register" ? (
            <Register setPage={setPage} />
          ) : page === "forgetPassword" ? (
            <ForgetPassword setPage={setPage} />
          ) : (
            ""
          )}
        </section>
      ) : (
        <section className={style.not_available_page}>
          <div>
            <h2>Not available page</h2>

            <p>
              You have already authenticated, you can logout to reauthenticate.
            </p>

            <div className={style.buttons}>
              <button onClick={goBack}>Go Back</button>
              <button onClick={goHome}>Go Home</button>
              <button onClick={logout}>Log Out</button>
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default Authentication;
