import { useState, useEffect } from "react";
import { MoonLoader } from "react-spinners";
import { VideoCard } from "../../components";
import { useHandleErrors, useInfiniteScroll } from "../../hooks";
import axios from "../../api/axios";
import style from "./Home.module.css";

const Home = () => {
  const limit = 15;
  const [page, setPage] = useState(1);

  const [videos, setVideos] = useState([]);
  const [exceptedVideos, setExceptedVideos] = useState([]);
  const [fetchVideosLoad, setFetchVideosLoad] = useState(false);

  const handleErrors = useHandleErrors();
  useInfiniteScroll(setPage);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setFetchVideosLoad(true);

        const res = await axios.get(
          `/videos/Explore?page=${page}&limit=${limit}&exceptedVideos=${exceptedVideos.join(
            ","
          )}`
        );

        setVideos((prev) => [...prev, ...res.data.data]);

        setExceptedVideos((prev) => [
          ...prev,
          ...res.data.data.map((video) => video?._id),
        ]);
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
    <div className={style.home}>
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

export default Home;
