/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { MoonLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faBookmark,
  faClipboard,
} from "@fortawesome/free-regular-svg-icons";
import ProfileControllers from "./components/ProfileControllers/ProfileControllers";
import VideosViewer from "./components/VideosViewer/VideosViewer";
import DeleteAccount from "./components/DeleteAccount/DeleteAccount";
import {
  useAxiosPrivate,
  useHandleErrors,
  useInfiniteScroll,
} from "../../hooks";
import axios from "../../api/axios";
import defaultAvatar from "../../assets/defaultAvatar.png";
import style from "./Profile.module.css";

const Profile = ({ socket }) => {
  const { userId } = useParams(); // general user id
  const user = useSelector((state) => state.user); // current user - visitor

  const [prevUserId, setPrevUserId] = useState(null);

  const [userData, setUserData] = useState(false);
  const [fetchUserLoad, setFetchUserLoad] = useState(false);

  const [subscribeLoad, setSubscribeLoad] = useState(false);
  const [unsubscribeLoad, setUnsubscribeLoad] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const videosLimit = 15;
  const [videosPage, setVideosPage] = useState(1);

  const [videosType, setVideosType] = useState("createdVideos");
  const [videos, setVideos] = useState([]);
  const [fetchVideosLoad, setFetchVideosLoad] = useState(false);

  const [openDeleteAccount, setOpenDeleteAccount] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();
  useInfiniteScroll(setVideosPage);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setFetchUserLoad(true);
        const res = await axios.get(`/users/${userId}`);
        setUserData(res.data.data);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchUserLoad(false);
      }
    };

    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Check if current user subscribed this profile
  useEffect(() => {
    const checkIsSubscribed = async () => {
      try {
        if (user?.accessToken && user._id !== userId) {
          const res = await axios.get(
            `/users/${user._id}/subscriptions/${userId}`
          );
          setIsSubscribed(Boolean(res.data.data));
        }
      } catch (err) {
        handleErrors(err);
      }
    };

    checkIsSubscribed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Subscribe current user to this profile
  const subscribe = async (userId, channelId) => {
    try {
      setSubscribeLoad(true);
      const res = await axiosPrivate.patch(
        `users/${userId}/subscriptions/${channelId}`
      );
      setIsSubscribed(true);
      socket.emit("sendNotification", res.data.data.notification);
    } catch (err) {
      handleErrors(err);
    } finally {
      setSubscribeLoad(false);
    }
  };

  // Unsubscribe current user to this profile
  const unsubscribe = async (userId, channelId) => {
    try {
      setUnsubscribeLoad(true);
      await axiosPrivate.delete(`users/${userId}/subscriptions/${channelId}`);
      setIsSubscribed(false);
    } catch (err) {
      handleErrors(err);
    } finally {
      setUnsubscribeLoad(false);
    }
  };

  // Fetch videos function
  const fetchVideos = async () => {
    try {
      setFetchVideosLoad(true);
      const res = await axiosPrivate.get(
        `/users/${userId}/${videosType}?page=${videosPage}&limit=${videosLimit}`
      );
      setVideos((prev) => [...prev, ...res.data.data]);
    } catch (err) {
      handleErrors(err);
    } finally {
      setFetchVideosLoad(false);
    }
  };

  // Effect to fetch videos when videosPage, videosType, or userId changes
  useEffect(() => {
    if (userId !== null && userId !== prevUserId) {
      // Clear videos and reset pagination variables when userId changes
      setVideos([]);
      setVideosPage(1);
      setVideosType("createdVideos");
      setPrevUserId(userId);
    } else if (userId !== null) {
      // Fetch videos when videosPage or videosType changes
      fetchVideos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videosPage, videosType, userId]);

  // Fetch initial videos when userId is set
  useEffect(() => {
    if (userId !== null) {
      fetchVideos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Handle change on videos type to fetch new videos
  const handleVideosTypeChange = (checkedVideosType) => {
    setVideosPage(1);
    setVideos([]);
    setVideosType(checkedVideosType);
  };

  return (
    <>
      {fetchUserLoad ? (
        <div className={style.loading_container}>
          <MoonLoader color="#000" size={20} />
        </div>
      ) : userData?._id ? (
        <div className={style.profile}>
          {/* User Information */}
          <div className={style.user_info}>
            {/* user picture */}
            <img
              src={userData.avatarUrl || defaultAvatar}
              alt=""
              className={style.left_side}
            />

            <div className={style.right_side}>
              {/* user name && controllers */}
              <div>
                <span className={style.user_name}>{userData.name}</span>

                <ProfileControllers
                  userId={userId}
                  setOpenDeleteAccount={setOpenDeleteAccount}
                />
              </div>

              {/* user email */}
              <a href={`mailto:${userData.email}`} className={style.user_email}>
                {userData.email}
              </a>

              {/* subscribe && unsubscribe */}
              {!user?.accessToken || user._id === userId ? (
                ""
              ) : isSubscribed ? (
                <button
                  type="button"
                  title="unsubscribe"
                  disabled={unsubscribeLoad ? true : false}
                  onClick={() => unsubscribe(user._id, userId)}
                  className={style.subscribe}
                >
                  <span>Unsubscribe</span>
                  {unsubscribeLoad ? <MoonLoader color="#000" size={17} /> : ""}
                </button>
              ) : !isSubscribed ? (
                <button
                  type="button"
                  title="subscribe"
                  disabled={subscribeLoad ? true : false}
                  onClick={() => subscribe(user._id, userId)}
                  className={style.unsubscribe}
                >
                  <span>Subscribe</span>
                  {subscribeLoad ? <MoonLoader color="#000" size={17} /> : ""}
                </button>
              ) : (
                ""
              )}
            </div>
          </div>

          {/* Break Line */}
          <div className={style.line}></div>

          {/* Video Container */}
          <div className={style.videos_container}>
            <ul className={style.taps_buttons}>
              <li>
                <button
                  type="button"
                  onClick={() => handleVideosTypeChange("createdVideos")}
                  className={videosType === "createdVideos" ? style.active : ""}
                >
                  <FontAwesomeIcon icon={faClipboard} />
                  <span>Videos</span>
                </button>
              </li>
              {user?._id === userId ? (
                <li>
                  <button
                    type="button"
                    onClick={() => handleVideosTypeChange("savedVideos")}
                    className={videosType === "savedVideos" ? style.active : ""}
                  >
                    <FontAwesomeIcon icon={faBookmark} />
                    <span>Saved</span>
                  </button>
                </li>
              ) : (
                ""
              )}
              {user?._id === userId ? (
                <li>
                  <button
                    type="button"
                    onClick={() => handleVideosTypeChange("likedVideos")}
                    className={videosType === "likedVideos" ? style.active : ""}
                  >
                    <FontAwesomeIcon icon={faHeart} />
                    <span>Liked</span>
                  </button>
                </li>
              ) : (
                ""
              )}
            </ul>

            <VideosViewer videos={videos} fetchVideosLoad={fetchVideosLoad} />
          </div>

          {/* Delete Account Form */}
          {openDeleteAccount ? (
            <DeleteAccount
              userId={userId}
              setOpenDeleteAccount={setOpenDeleteAccount}
            />
          ) : (
            ""
          )}
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default Profile;
