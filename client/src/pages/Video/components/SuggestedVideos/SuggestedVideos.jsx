import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { VideoCard } from "../../../../components";
import { useHandleErrors } from "../../../../hooks";
import axios from "../../../../api/axios";
import style from "./SuggestedVideos.module.css";

const SuggestedVideos = () => {
  const { videoId } = useParams();

  const limit = 5;
  const [videos, setVideos] = useState([]);

  const handleErrors = useHandleErrors();

  // Fetch suggested random videos
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get(
          `/videos/Explore?page=1&limit=${limit}&exceptedVideos=${videoId}`
        );
        setVideos(res.data.data);
      } catch (err) {
        handleErrors(err);
      }
    };

    fetchVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={style.suggested_videos}>
      {videos.length > 0
        ? videos.map((video) => <VideoCard key={video._id} video={video} />)
        : ""}
    </div>
  );
};

export default SuggestedVideos;
