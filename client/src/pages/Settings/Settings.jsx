import { Navigate, useLocation, useParams } from "react-router-dom";
import Controllers from "./components/Controllers/Controllers";
import CreatedVideos from "./components/CreatedVideos/CreatedVideos";
import SavedVideos from "./components/SavedVideos/SavedVideos";
import LikedVideos from "./components/LikedVideos/LikedVideos";
import Subscriptions from "./components/Subscriptions/Subscriptions";
import Subscribers from "./components/Subscribers/Subscribers";
import CreatedComments from "./components/CreatedComments/CreatedComments";
import style from "./Settings.module.css";

const Settings = () => {
  const { tab } = useParams();

  const location = useLocation();

  return (
    <div className={style.settings}>
      <h2>My Settings</h2>

      <div className={style.header}>
        <Controllers />
      </div>

      <div className={style.line}></div>

      <div className={style.current_section}>
        {tab === undefined || tab === "createdVideos" ? (
          <CreatedVideos />
        ) : tab === "savedVideos" ? (
          <SavedVideos />
        ) : tab === "likedVideos" ? (
          <LikedVideos />
        ) : tab === "subscriptions" ? (
          <Subscriptions />
        ) : tab === "subscribers" ? (
          <Subscribers />
        ) : tab === "createdComments" ? (
          <CreatedComments />
        ) : (
          <Navigate to="/noResourceFound" state={{ from: location }} replace />
        )}
      </div>
    </div>
  );
};

export default Settings;
