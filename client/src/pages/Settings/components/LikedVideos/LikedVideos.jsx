import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import VideosViewer from "../VideosViewer/VideosViewer";
import {
  useAxiosPrivate,
  useHandleErrors,
  useInfiniteScroll,
} from "../../../../hooks";
import style from "./LikedVideos.module.css";

const LikedPosts = () => {
  const user = useSelector((state) => state.user);

  const likedVideosLimit = 15;
  const [likedVideosPage, setLikedVideosPage] = useState(1);

  const [likedVideos, setLikedVideos] = useState([]);
  const [fetchVideosLoad, setFetchVideosLoad] = useState(true);

  const removeVideoType = "unlikeVideo";

  const handleErrors = useHandleErrors();
  const axiosPrivate = useAxiosPrivate();
  useInfiniteScroll(setLikedVideosPage);

  // Fetch liked videos
  useEffect(() => {
    const fetchLikedVideos = async () => {
      try {
        setFetchVideosLoad(true);
        const res = await axiosPrivate.get(
          `/users/${user._id}/likedVideos?page=${likedVideosPage}&limit=${likedVideosLimit}`
        );
        setLikedVideos((prev) => [...prev, ...res.data.data]);
      } catch (err) {
        handleErrors(err);
      } finally {
        setFetchVideosLoad(false);
      }
    };

    fetchLikedVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [likedVideosPage]);

  return (
    <div className={`${style.liked_posts}`}>
      <VideosViewer
        videos={likedVideos}
        setVideos={setLikedVideos}
        fetchVideosLoad={fetchVideosLoad}
        removeVideoType={removeVideoType}
      />
    </div>
  );
};

export default LikedPosts;
