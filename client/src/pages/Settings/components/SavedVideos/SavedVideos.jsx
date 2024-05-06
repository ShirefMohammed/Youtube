import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import VideosViewer from "../VideosViewer/VideosViewer";
import {
  useAxiosPrivate,
  useHandleErrors,
  useInfiniteScroll,
} from "../../../../hooks";
import style from "./SavedVideos.module.css";

const SavedVideos = () => {
  const user = useSelector((state) => state.user);

  const savedVideosLimit = 15;
  const [savedVideosPage, setSavedVideosPage] = useState(1);

  const [savedVideos, setSavedVideos] = useState([]);
  const [fetchVideosLoad, setFetchVideosLoad] = useState(true);

  const removeVideoType = "unsaveVideo";

  const handleErrors = useHandleErrors();
  const axiosPrivate = useAxiosPrivate();
  useInfiniteScroll(setSavedVideosPage);

  // Fetch saved videos
  useEffect(() => {
    const fetchSavedVideos = async () => {
      try {
        setFetchVideosLoad(true);
        const res = await axiosPrivate.get(
          `/users/${user._id}/savedVideos?page=${savedVideosPage}&limit=${savedVideosLimit}`
        );
        setSavedVideos((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchVideosLoad(false);
      }
    };

    fetchSavedVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [savedVideosPage]);

  return (
    <div className={`${style.saved_posts}`}>
      <VideosViewer
        videos={savedVideos}
        setVideos={setSavedVideos}
        fetchVideosLoad={fetchVideosLoad}
        removeVideoType={removeVideoType}
      />
    </div>
  );
};

export default SavedVideos;
