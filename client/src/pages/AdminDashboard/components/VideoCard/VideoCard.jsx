/* eslint-disable react/prop-types */
import { useState } from "react";
import { PuffLoader } from "react-spinners";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { VideoCard as VideoCardGeneral } from "../../../../components";
import { useAxiosPrivate, useNotify } from "../../../../hooks";
import style from "./VideoCard.module.css";

const VideoCard = ({ video, videos, setVideos }) => {
  const [removeLoading, setRemoveLoading] = useState(false);

  const axiosPrivate = useAxiosPrivate();
  const notify = useNotify();

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

  return (
    <div className={style.video_card}>
      <VideoCardGeneral video={video} />

      <button
        type="button"
        title="delete this video"
        className={style.delete_video_btn}
        onClick={() => deleteVideo(video._id)}
        disabled={removeLoading ? true : false}
        style={removeLoading ? { opacity: 0.5, cursor: "revert" } : {}}
      >
        {removeLoading ? (
          <PuffLoader color="#000" size={20} />
        ) : (
          <FontAwesomeIcon icon={faTrashCan} />
        )}
      </button>
    </div>
  );
};

export default VideoCard;
