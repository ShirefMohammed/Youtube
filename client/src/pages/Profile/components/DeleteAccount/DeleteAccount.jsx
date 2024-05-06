/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { MoonLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import { useAxiosPrivate, useLogout, useNotify } from "../../../../hooks";
import ROLES_LIST from "../../../../utils/roles_list";
import style from "./DeleteAccount.module.css";

const DeleteAccount = ({ userId, setOpenDeleteAccount }) => {
  const user = useSelector((state) => state.user); // current user - visitor

  const errRef = useRef(null);
  const [errMsg, setErrMsg] = useState("");

  const [password, setPassword] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const logout = useLogout();
  const notify = useNotify();

  // Reset error message while changing password
  useEffect(() => {
    setErrMsg("");
  }, [password]);

  const deleteAccount = async (e) => {
    e.preventDefault();

    try {
      setDeleteLoading(true);

      await axiosPrivate({
        method: "delete",
        url: `/users/${userId}`,
        data: { password: password },
      });

      if (user.roles.includes(ROLES_LIST.Admin)) {
        navigate("/");
        notify("success", "Account is deleted");
      } else {
        logout();
        notify("success", "Account is deleted");
      }
    } catch (err) {
      if (!err?.response) setErrMsg("No Server Response");
      const message = err.response?.data?.message;
      message ? setErrMsg(message) : setErrMsg("Account is not deleted");
      errRef.current.focus();
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className={style.delete_account}>
      <form onSubmit={deleteAccount}>
        {/* Title */}
        <h2>Delete Account</h2>

        {/* Close Button */}
        <button
          type="button"
          title="close"
          className={style.close_btn}
          onClick={() => setOpenDeleteAccount(false)}
        >
          <FontAwesomeIcon icon={faX} />
        </button>

        {/* Error Message */}
        <div ref={errRef} aria-live="assertive">
          {errMsg && <p className={style.error_message}>{errMsg}</p>}
        </div>

        {/* Password Input */}
        {!user?.roles?.includes(ROLES_LIST.Admin) ? (
          <div>
            <label htmlFor="Password">Password:</label>
            <input
              type="password"
              id="Password"
              placeholder="Enter your password"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              required
            />
          </div>
        ) : (
          ""
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={deleteLoading ? true : false}
          style={deleteLoading ? { opacity: 0.5, cursor: "revert" } : {}}
        >
          <span>Delete the Account</span>
          {deleteLoading && <MoonLoader color="#fff" size={10} />}
        </button>
      </form>
    </div>
  );
};

export default DeleteAccount;
