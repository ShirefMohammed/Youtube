import { useEffect, useState } from "react";
import { MoonLoader } from "react-spinners";
import VideoCard from "../VideoCard/VideoCard";
import {
  useAxiosPrivate,
  useHandleErrors,
  useInfiniteScroll,
} from "../../../../hooks";
import style from "./Videos.module.css";

const Videos = () => {
  const limit = 15;
  const [videosPage, setVideosPage] = useState(1);

  const [videos, setVideos] = useState([]);
  const [fetchVideosLoad, setFetchVideosLoad] = useState(false);

  const handleErrors = useHandleErrors();
  const axiosPrivate = useAxiosPrivate();
  useInfiniteScroll(setVideosPage);

  // Fetch created videos to admin
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setFetchVideosLoad(true);
        const res = await axiosPrivate.get(
          `/Videos?page=${videosPage}&limit=${limit}`
        );
        setVideos((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchVideosLoad(false);
      }
    };

    fetchVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videosPage]);

  return (
    <div className={`${style.videos_viewer}`}>
      {fetchVideosLoad && videos.length === 0 ? (
        <div className={style.loading_container}>
          <MoonLoader color="#000" size={20} />
        </div>
      ) : videos.length > 0 ? (
        <div className={style.videos}>
          {videos.map((video) => (
            <VideoCard
              key={video._id}
              video={video}
              videos={videos}
              setVideos={setVideos}
            />
          ))}
        </div>
      ) : (
        <p className={style.no_videos}>No Videos Here</p>
      )}
    </div>
  );
};

export default Videos;
