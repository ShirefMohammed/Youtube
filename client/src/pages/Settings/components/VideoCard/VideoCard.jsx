/* eslint-disable react/prop-types */
import { useState } from "react";
import { Link } from "react-router-dom";
import { PuffLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { faPenToSquare } from "@fortawesome/free-regular-svg-icons";
import { VideoCard as VideoCardGeneral } from "../../../../components";
import { useAxiosPrivate, useNotify } from "../../../../hooks";
import style from "./VideoCard.module.css";

const VideoCard = ({ video, removeVideoType, videos, setVideos }) => {
  const [removeLoading, setRemoveLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const notify = useNotify();

  const handleRemove = (videoId) => {
    if (removeVideoType === "deleteVideo") {
      deleteVideo(videoId);
    } else if (removeVideoType === "unsaveVideo") {
      unsaveVideo(videoId);
    } else if (removeVideoType === "unlikeVideo") {
      unlikeVideo(videoId);
    }
  };

  const deleteVideo = async (videoId) => {
    try {
      setRemoveLoading(true);
      await axiosPrivate.delete(`/videos/${videoId}`);
      setVideos(videos.filter((video) => video._id !== videoId));
      notify("success", "Video is deleted");
    } catch (err) {
      if (!err?.response) notify("error", "No Server Response");
      const message = err.response?.data?.message;
      message
        ? notify("error", message)
        : notify("error", "Video is not deleted");
    } finally {
      setRemoveLoading(false);
    }
  };

  const unsaveVideo = async (videoId) => {
    try {
      setRemoveLoading(true);
      await axiosPrivate.delete(`/videos/${videoId}/save`);
      setVideos(videos.filter((video) => video._id !== videoId));
      notify("success", "Video is unsaved");
    } catch (err) {
      if (!err?.response) notify("error", "No Server Response");
      const message = err.response?.data?.message;
      message
        ? notify("error", message)
        : notify("error", "Video is not unsaved");
    } finally {
      setRemoveLoading(false);
    }
  };

  const unlikeVideo = async (videoId) => {
    try {
      setRemoveLoading(true);
      await axiosPrivate.delete(`/videos/${videoId}/likes`);
      setVideos(videos.filter((video) => video._id !== videoId));
      notify("success", "Video is removed from liked");
    } catch (err) {
      if (!err?.response) notify("error", "No Server Response");
      const message = err.response?.data?.message;
      message
        ? notify("error", message)
        : notify("error", "Video is not removed from liked");
    } finally {
      setRemoveLoading(false);
    }
  };

  return (
    <div className={style.video_card}>
      <VideoCardGeneral video={video} />

      <button
        type="button"
        title={
          removeVideoType === "deleteVideo"
            ? "delete this video"
            : removeVideoType === "unsaveVideo"
            ? "unsave this video"
            : removeVideoType === "unsaveVideo"
            ? "unlike this video"
            : ""
        }
        className={style.delete_video_btn}
        onClick={() => handleRemove(video._id)}
        disabled={removeLoading ? true : false}
        style={removeLoading ? { opacity: 0.5, cursor: "revert" } : {}}
      >
        {removeLoading ? (
          <PuffLoader color="#000" size={20} />
        ) : (
          <FontAwesomeIcon icon={faTrashCan} />
        )}
      </button>

      {removeVideoType === "deleteVideo" ? (
        <Link
          to={`/videos/${video._id}/update`}
          title="update this video"
          className={style.update_video_link}
        >
          <FontAwesomeIcon icon={faPenToSquare} />
        </Link>
      ) : (
        ""
      )}
    </div>
  );
};

export default VideoCard;
