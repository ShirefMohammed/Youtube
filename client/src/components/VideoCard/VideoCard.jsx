/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import formatCreatedAt from "../../utils/formatCreatedAt";
import defaultVideoThumbnail from "../../assets/defaultVideoThumbnail.png";
import style from "./VideoCard.module.css";

const VideoCard = ({ video }) => {
  return (
    <div className={style.video_card}>
      <Link to={`/videos/${video._id}`}>
        <img
          src={video.thumbnailUrl || defaultVideoThumbnail}
          alt=""
          loading="lazy"
        />
      </Link>

      <div className={style.description}>
        <Link to={`/users/${video.creator._id}`} className={style.left_side}>
          <img
            src={video.creator.avatarUrl}
            alt=""
            title={video.creator.name}
          />
        </Link>

        <div className={style.right_side}>
          <Link to={`/videos/${video._id}`}>
            <p>{video.title}</p>
          </Link>

          <Link to={`/users/${video.creator._id}`}>
            <span>{video.creator.name}</span>
          </Link>

          <div className={style.video_details}>
            <span>{video.viewsNumber} views</span> .{" "}
            <span>{formatCreatedAt(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
