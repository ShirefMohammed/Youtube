import { Navigate, useLocation, useParams } from "react-router-dom";
import Header from "./components/Header/Header";
import Videos from "./components/Videos/Videos";
import Users from "./components/Users/Users";
import style from "./AdminDashboard.module.css";

const AdminDashboard = () => {
  const { tab } = useParams();

  const location = useLocation();

  return (
    <div className={style.admin_dashboard}>
      <Header />

      <div className={style.line}></div>

      {tab === undefined || tab === "videos" ? (
        <Videos />
      ) : tab === "users" ? (
        <Users />
      ) : (
        <Navigate to="/noResourceFound" state={{ from: location }} replace />
      )}
    </div>
  );
};

export default AdminDashboard;
