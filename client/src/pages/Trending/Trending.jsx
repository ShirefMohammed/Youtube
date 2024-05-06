import { useState, useEffect } from "react";
import { MoonLoader } from "react-spinners";
import { VideoCard } from "../../components";
import { useHandleErrors, useInfiniteScroll } from "../../hooks";
import axios from "../../api/axios";
import style from "./Trending.module.css";

const Trending = () => {
  const limit = 15;
  const [page, setPage] = useState(1);

  const [videos, setVideos] = useState([]);
  const [fetchVideosLoad, setFetchVideosLoad] = useState(false);

  const handleErrors = useHandleErrors();
  useInfiniteScroll(setPage);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setFetchVideosLoad(true);
        const res = await axios.get(
          `/videos/trending?page=${page}&limit=${limit}`
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
  }, [page]);

  return (
    <div className={style.trending}>
      {fetchVideosLoad && videos.length === 0 ? (
        <div className={style.loading_container}>
          <MoonLoader color="#000" size={20} />
        </div>
      ) : videos.length > 0 ? (
        <div className={style.videos_container}>
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default Trending;
