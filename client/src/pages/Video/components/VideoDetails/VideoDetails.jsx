/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { MoonLoader, PuffLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookmark as faBookmarkRegular,
  faThumbsUp as faThumbsUpRegular,
} from "@fortawesome/free-regular-svg-icons";
import {
  faBookmark as faBookmarkSolid,
  faThumbsUp as faThumbsUpSolid,
} from "@fortawesome/free-solid-svg-icons";
import { useAxiosPrivate, useHandleErrors } from "../../../../hooks";
import formatLikes from "../../../../utils/formatLikes";
import axios from "../../../../api/axios";
import defaultVideoThumbnail from "../../../../assets/defaultVideoThumbnail.png";
import defaultAvatar from "../../../../assets/defaultAvatar.png";
import style from "./VideoDetails.module.css";

const VideoDetails = ({ video, socket }) => {
  const user = useSelector((state) => state.user);

  const [subscribeLoad, setSubscribeLoad] = useState(false);
  const [unsubscribeLoad, setUnsubscribeLoad] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const [likeLoad, setLikeLoad] = useState(false);
  const [unLikeLoad, setUnLikeLoad] = useState(false);
  const [isVideoLiked, setIsVideoLiked] = useState(false);

  const [saveLoad, setSaveLoad] = useState(false);
  const [unsaveLoad, setUnSaveLoad] = useState(false);
  const [isVideoSaved, setIsVideoSaved] = useState(false);

  const [likesNumber, setLikesNumber] = useState(video.likesNumber);
  const [viewMoreDisc, setViewMoreDisc] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const handleErrors = useHandleErrors();

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

  const likeVideo = async (videoId) => {
    try {
      setLikeLoad(true);
      await axiosPrivate.patch(`videos/${videoId}/likes`);
      setIsVideoLiked(true);
      setLikesNumber((prev) => prev + 1);
    } catch (err) {
      handleErrors(err);
    } finally {
      setLikeLoad(false);
    }
  };

  const unLikeVideo = async (videoId) => {
    try {
      setUnLikeLoad(true);
      await axiosPrivate.delete(`videos/${videoId}/likes`);
      setIsVideoLiked(false);
      setLikesNumber((prev) => prev - 1);
    } catch (err) {
      handleErrors(err);
    } finally {
      setUnLikeLoad(false);
    }
  };

  const saveVideo = async (videoId) => {
    try {
      setSaveLoad(true);
      await axiosPrivate.patch(`videos/${videoId}/save`);
      setIsVideoSaved(true);
    } catch (err) {
      handleErrors(err);
    } finally {
      setSaveLoad(false);
    }
  };

  const unsaveVideo = async (videoId) => {
    try {
      setUnSaveLoad(true);
      await axiosPrivate.delete(`videos/${videoId}/save`);
      setIsVideoSaved(false);
    } catch (err) {
      handleErrors(err);
    } finally {
      setUnSaveLoad(false);
    }
  };

  const formatVideoDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  // Check if current user subscribed this video creator channel
  useEffect(() => {
    const checkIsSubscribed = async () => {
      try {
        if (user?.accessToken) {
          const res = await axios.get(
            `/users/${user._id}/subscriptions/${video.creator._id}`
          );
          setIsSubscribed(Boolean(res.data.data));
        }
      } catch (err) {
        handleErrors(err);
      }
    };

    checkIsSubscribed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if current user liked this video
  useEffect(() => {
    const checkIsVideoLiked = async () => {
      try {
        if (user?.accessToken) {
          const res = await axiosPrivate.get(`videos/${video._id}/likes`);
          setIsVideoLiked(Boolean(res.data.data));
        }
      } catch (err) {
        handleErrors(err);
      }
    };

    checkIsVideoLiked();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if current user saved this video
  useEffect(() => {
    const checkIsVideoSaved = async () => {
      try {
        if (user?.accessToken) {
          const res = await axiosPrivate.get(`videos/${video._id}/save`);
          setIsVideoSaved(Boolean(res.data.data));
        }
      } catch (err) {
        handleErrors(err);
      }
    };

    checkIsVideoSaved();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={style.video_details}>
      {/* Video Player Section */}
      <video poster={video.thumbnailUrl || defaultVideoThumbnail} controls>
        <source src={video.videoUrl} type="video/mp4" />
        <source src={video.videoUrl} type="video/ogg" />
        Your browser does not support the video tag.
      </video>

      {/* Video Title Section */}
      <p className={style.video_title}>{video.title}</p>

      {/* Video Actions Section */}
      <div className={style.video_actions}>
        {/* channel actions */}
        <div>
          {/* video creator link */}
          <Link to={`/users/${video.creator._id}`}>
            <img src={video.creator.avatarUrl || defaultAvatar} alt="" />
            <span>{video.creator.name}</span>
          </Link>

          {/* subscribe && unsubscribe */}
          {!user?.accessToken || user._id === video.creator._id ? (
            ""
          ) : isSubscribed ? (
            <button
              type="button"
              title="unsubscribe"
              disabled={unsubscribeLoad ? true : false}
              onClick={() => unsubscribe(user._id, video.creator._id)}
            >
              <span>Unsubscribe</span>
              {unsubscribeLoad ? <MoonLoader color="#000" size={17} /> : ""}
            </button>
          ) : !isSubscribed ? (
            <button
              type="button"
              title="subscribe"
              disabled={subscribeLoad ? true : false}
              onClick={() => subscribe(user._id, video.creator._id)}
            >
              <span>Subscribe</span>
              {subscribeLoad ? <MoonLoader color="#000" size={17} /> : ""}
            </button>
          ) : (
            ""
          )}
        </div>

        {/* video actions */}
        <div>
          {/* like && unlike */}
          {!user?.accessToken ? (
            ""
          ) : isVideoLiked ? (
            <button
              type="button"
              title="unlike video"
              disabled={unLikeLoad ? true : false}
              onClick={() => unLikeVideo(video._id)}
            >
              {unLikeLoad ? (
                <PuffLoader color="#000" size={17} />
              ) : (
                <FontAwesomeIcon icon={faThumbsUpSolid} />
              )}
              <span>{formatLikes(likesNumber)}</span>
            </button>
          ) : !isVideoLiked ? (
            <button
              type="button"
              title="like video"
              disabled={likeLoad ? true : false}
              onClick={() => likeVideo(video._id)}
            >
              {likeLoad ? (
                <PuffLoader color="#000" size={17} />
              ) : (
                <FontAwesomeIcon icon={faThumbsUpRegular} />
              )}
              <span>{formatLikes(likesNumber)}</span>
            </button>
          ) : (
            ""
          )}

          {/* save && unsave */}
          {!user?.accessToken ? (
            ""
          ) : isVideoSaved ? (
            <button
              type="button"
              title="unsave video"
              disabled={unsaveLoad ? true : false}
              onClick={() => unsaveVideo(video._id)}
            >
              {unsaveLoad ? (
                <PuffLoader color="#000" size={17} />
              ) : (
                <FontAwesomeIcon icon={faBookmarkSolid} />
              )}
            </button>
          ) : !isVideoSaved ? (
            <button
              type="button"
              title="save video"
              disabled={saveLoad ? true : false}
              onClick={() => saveVideo(video._id)}
            >
              {saveLoad ? (
                <PuffLoader color="#000" size={17} />
              ) : (
                <FontAwesomeIcon icon={faBookmarkRegular} />
              )}
            </button>
          ) : (
            ""
          )}
        </div>
      </div>

      {/* Video Desc Section */}
      <div className={style.video_desc}>
        <div>
          <span>{video.viewsNumber} views</span>
          <span>{formatVideoDate(video.createdAt)}</span>
        </div>

        {video.desc.length > 150 ? (
          <pre>
            {viewMoreDisc ? video.desc : video.desc.substring(0, 151)}
            {viewMoreDisc ? (
              <button type="button" onClick={() => setViewMoreDisc(false)}>
                Show less
              </button>
            ) : (
              <button type="button" onClick={() => setViewMoreDisc(true)}>
                ...more
              </button>
            )}
          </pre>
        ) : (
          <pre>{video.desc}</pre>
        )}
      </div>
    </div>
  );
};

export default VideoDetails;
