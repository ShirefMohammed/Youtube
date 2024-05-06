import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faCompass,
  faFire,
  faHeart,
  faBell,
  faCog,
  faPlusSquare,
  faSignInAlt,
  faSignOutAlt,
  faBookmark,
  faCircleHalfStroke,
  faAddressCard,
} from "@fortawesome/free-solid-svg-icons";
import { useApplyTheme, useLogout } from "../../../../hooks";
import YoutubeLogo from "../../../../assets/YoutubeLogo.svg";
import style from "./Sidebar.module.css";
import { useEffect, useState } from "react";

const Sidebar = () => {
  const { pathname } = useLocation();

  const user = useSelector((state) => state.user);
  const notifications = useSelector((state) => state.notifications);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const applyTheme = useApplyTheme();
  const logout = useLogout();

  // Change Theme
  const changeTheme = (e) => {
    e.preventDefault();

    let theme = localStorage.getItem("theme");

    if (theme === "light") {
      localStorage.setItem("theme", "dark");
      theme = "dark";
    } else {
      localStorage.setItem("theme", "light");
      theme = "light";
    }

    applyTheme(theme);
  };

  // Set unread notifications
  useEffect(() => {
    let unread = 0;

    for (const notification of notifications) {
      if (!notification.isRead) {
        unread++;
      }
    }

    setUnreadNotifications(unread);
  }, [notifications]);

  return (
    <aside className={style.sidebar}>
      {/* Logo */}
      <Link to="/" className={style.logo}>
        <img src={YoutubeLogo} alt="" />
        <span>Youtube</span>
      </Link>

      <nav>
        {/* Section 1 */}
        <ul className={style.links}>
          <li>
            <Link
              to="/"
              className={
                pathname === "/" || pathname === "/home" ? style.active : ""
              }
              title="home"
            >
              <FontAwesomeIcon icon={faHome} />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link
              to="/explore"
              className={pathname === "/explore" ? style.active : ""}
              title="explore"
            >
              <FontAwesomeIcon icon={faCompass} />
              <span>Explore</span>
            </Link>
          </li>
          <li>
            <Link
              to="/trending"
              className={pathname === "/trending" ? style.active : ""}
              title="trending"
            >
              <FontAwesomeIcon icon={faFire} />
              <span>Trending</span>
            </Link>
          </li>
          <li>
            <Link
              to="/subscriptions"
              className={pathname === "/subscriptions" ? style.active : ""}
              title="subscriptions"
            >
              <FontAwesomeIcon icon={faHeart} />
              <span>Subscriptions</span>
            </Link>
          </li>
        </ul>

        {/* Section 2 */}
        <ul className={style.links}>
          <li>
            <Link
              to="/settings/likedVideos"
              className={
                pathname === "/settings/likedVideos" ? style.active : ""
              }
              title="liked videos"
            >
              <FontAwesomeIcon icon={faHeart} />
              <span>Liked Videos</span>
            </Link>
          </li>
          <li>
            <Link
              to="/settings/savedVideos"
              className={
                pathname === "/settings/savedVideos" ? style.active : ""
              }
              title="saved videos"
            >
              <FontAwesomeIcon icon={faBookmark} />
              <span>Saved Videos</span>
            </Link>
          </li>
          <li>
            <Link
              to="/notifications"
              className={pathname === "/notifications" ? style.active : ""}
              title="notifications"
            >
              <FontAwesomeIcon icon={faBell} />
              <span>Notifications</span>
              {unreadNotifications ? (
                <span className={style.unread_notifications}>
                  {unreadNotifications}
                </span>
              ) : (
                ""
              )}
            </Link>
          </li>
          <li>
            <Link
              to="/settings"
              className={pathname === "/settings" ? style.active : ""}
              title="settings"
            >
              <FontAwesomeIcon icon={faCog} />
              <span>Settings</span>
            </Link>
          </li>
        </ul>

        {/* Section 3 */}
        <ul className={style.links}>
          <li>
            <Link
              to="/createVideo"
              className={pathname === "/createVideo" ? style.active : ""}
              title="create video"
            >
              <FontAwesomeIcon icon={faPlusSquare} />
              <span>Create Video</span>
            </Link>
          </li>
          <li>
            <Link onClick={changeTheme} title="change theme">
              <FontAwesomeIcon icon={faCircleHalfStroke} />
              <span>Change Theme</span>
            </Link>
          </li>
          <li>
            {user?.accessToken ? (
              <Link
                to={`/users/${user?._id}`}
                className={
                  pathname === `/users/${user?._id}` ? style.active : ""
                }
                title="my profile"
              >
                <FontAwesomeIcon icon={faAddressCard} />
                <span>Profile</span>
              </Link>
            ) : (
              <Link
                to="/authentication"
                className={pathname === "/authentication" ? style.active : ""}
                title="login"
              >
                <FontAwesomeIcon icon={faSignInAlt} />
                <span>Login</span>
              </Link>
            )}
          </li>
          {user?.accessToken && (
            <li>
              <Link to="/" onClick={logout} title="logout">
                <FontAwesomeIcon icon={faSignOutAlt} />
                <span>Logout</span>
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* Creator */}
      <p className={style.creator}>Created by Shiref Mohammed</p>
    </aside>
  );
};

export default Sidebar;
