import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import VideosViewer from "../VideosViewer/VideosViewer";
import { useHandleErrors, useInfiniteScroll } from "../../../../hooks";
import axios from "../../../../api/axios";
import style from "./CreatedVideos.module.css";

const CreatedVideos = () => {
  const user = useSelector((state) => state.user);

  const createdVideosLimit = 15;
  const [createdVideosPage, setCreatedVideosPage] = useState(1);

  const [createdVideos, setCreatedVideos] = useState([]);
  const [fetchVideosLoad, setFetchVideosLoad] = useState(true);

  const removeVideoType = "deleteVideo";

  const handleErrors = useHandleErrors();
  useInfiniteScroll(setCreatedVideosPage);

  // Fetch created videos
  useEffect(() => {
    const fetchCreatedVideos = async () => {
      try {
        setFetchVideosLoad(true);
        const res = await axios.get(
          `/users/${user._id}/createdVideos?page=${createdVideosPage}&limit=${createdVideosLimit}`
        );
        setCreatedVideos((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchVideosLoad(false);
      }
    };

    fetchCreatedVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createdVideosPage]);

  return (
    <div className={`${style.created_posts}`}>
      <VideosViewer
        videos={createdVideos}
        setVideos={setCreatedVideos}
        fetchVideosLoad={fetchVideosLoad}
        removeVideoType={removeVideoType}
      />
    </div>
  );
};

export default CreatedVideos;
