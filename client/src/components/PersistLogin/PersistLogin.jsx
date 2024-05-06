/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  useApplyTheme,
  useAxiosPrivate,
  useHandleErrors,
  useRefreshToken,
} from "../../hooks";
import {
  setNotifications,
  pushNotification,
} from "../../store/slices/notificationsSlice";
import YoutubeLogo from "../../assets/YoutubeLogo.svg";
import style from "./PersistLogin.module.css";

const PersistLogin = ({ socket }) => {
  const user = useSelector((state) => state.user);

  const [refreshLoad, setRefreshLoad] = useState(true);

  const refresh = useRefreshToken();
  const applyTheme = useApplyTheme();
  const handleErrors = useHandleErrors();
  const axiosPrivate = useAxiosPrivate();
  const dispatch = useDispatch();

  // Using refresh api to fetch user data
  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        if (user?.persist && !user?.accessToken) {
          await refresh();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setRefreshLoad(false);
      }
    };

    verifyRefreshToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply dark or light theme
  useEffect(() => {
    applyTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch current user notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.accessToken) return;
      try {
        const res = await axiosPrivate.get(`/users/${user._id}/notifications`);
        dispatch(setNotifications(res.data.data));
      } catch (err) {
        handleErrors(err);
      }
    };

    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.accessToken]);

  // User Joins socket room
  useEffect(() => {
    if (user?.accessToken) {
      socket.emit("setup", user._id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.accessToken]);

  // Receive notification event
  useEffect(() => {
    socket.on("receiveNotification", (notification) => {
      dispatch(pushNotification(notification));
    });

    return () => {
      socket.off("receiveNotification");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {
        // If no need to remember user
        !user?.persist ? (
          <Outlet />
        ) : // If refresh is loading to fetch accessToken by jwt
        refreshLoad ? (
          <div className={style.loading_container}>
            <img src={YoutubeLogo} alt="Youtube_Logo" />
            <div className={style.creator}>
              <span>Created by</span>
              <Link to="https://shiref-mohammed.onrender.com/">
                Shiref Mohammed
              </Link>
            </div>
          </div>
        ) : (
          // If refresh finished loading
          <Outlet />
        )
      }
    </>
  );
};

export default PersistLogin;
