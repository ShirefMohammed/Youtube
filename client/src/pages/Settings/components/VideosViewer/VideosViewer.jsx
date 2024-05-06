/* eslint-disable react/prop-types */
import { MoonLoader } from "react-spinners";
import VideoCard from "../VideoCard/VideoCard";
import style from "./VideosViewer.module.css";

const PostsViewer = ({
  videos,
  setVideos,
  fetchVideosLoad,
  removeVideoType,
}) => {
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
              removeVideoType={removeVideoType}
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

export default PostsViewer;
