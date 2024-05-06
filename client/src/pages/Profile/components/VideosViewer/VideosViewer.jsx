/* eslint-disable react/prop-types */
import { MoonLoader } from "react-spinners";
import { VideoCard } from "../../../../components";
import style from "./VideosViewer.module.css";

const PostsViewer = ({ videos, fetchVideosLoad }) => {
  return (
    <div className={style.videos_viewer}>
      {fetchVideosLoad && videos.length === 0 ? (
        <div className={style.loading_container}>
          <MoonLoader color="#000" size={20} />
        </div>
      ) : videos.length > 0 ? (
        <div className={style.videos}>
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      ) : (
        <p className={style.no_videos}>No videos here</p>
      )}
    </div>
  );
};

export default PostsViewer;
