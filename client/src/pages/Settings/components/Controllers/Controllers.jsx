import { Link, useParams } from "react-router-dom";
import style from "./Controllers.module.css";

const Controllers = () => {
  const { tab } = useParams();

  return (
    <nav className={style.controllers}>
      <Link
        to={`/settings/createdVideos`}
        className={
          tab === undefined || tab === "createdVideos" ? style.active : ""
        }
      >
        Created Videos
      </Link>
      <Link
        to={`/settings/savedVideos`}
        className={tab === "savedVideos" ? style.active : ""}
      >
        Saved Videos
      </Link>
      <Link
        to={`/settings/likedVideos`}
        className={tab === "likedVideos" ? style.active : ""}
      >
        Liked Videos
      </Link>
      <Link
        to={`/settings/subscriptions`}
        className={tab === "subscriptions" ? style.active : ""}
      >
        Subscriptions
      </Link>
      <Link
        to={`/settings/subscribers`}
        className={tab === "subscribers" ? style.active : ""}
      >
        Subscribers
      </Link>
      <Link
        to={`/settings/createdComments`}
        className={tab === "createdComments" ? style.active : ""}
      >
        Created Comments
      </Link>
    </nav>
  );
};

export default Controllers;
