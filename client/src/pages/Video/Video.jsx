/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MoonLoader } from "react-spinners";
import VideoDetails from "./components/VideoDetails/VideoDetails";
import Comments from "./components/Comments/Comments";
import SuggestedVideos from "./components/SuggestedVideos/SuggestedVideos";
import { useHandleErrors } from "../../hooks";
import axios from "../../api/axios";
import style from "./Video.module.css";

const Video = ({ socket }) => {
  const { videoId } = useParams();

  const [video, setVideo] = useState({});
  const [fetchVideoLoad, setFetchVideoLoad] = useState(false);

  const handleErrors = useHandleErrors();

  // Fetch video data
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setFetchVideoLoad(true);
        const res = await axios.get(`/videos/${videoId}`);
        setVideo(res.data.data);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchVideoLoad(false);
      }
    };

    fetchVideo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  return (
    <>
      {fetchVideoLoad ? (
        <div className={style.loading_container}>
          <MoonLoader color="#000" size={20} />
        </div>
      ) : video?._id ? (
        <div className={style.video}>
          <div className={style.left_side}>
            <VideoDetails video={video} socket={socket} />
            <Comments videoId={video._id} socket={socket} />
          </div>

          <div className={style.right_side}>
            <SuggestedVideos />
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default Video;
