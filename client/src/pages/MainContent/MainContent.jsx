/* eslint-disable react/prop-types */
import { Route, Routes } from "react-router-dom";
import { FirstReqLoadingMsg, RequireAuth, ToastContainerWithProps } from "../../components";
import Sidebar from "./components/Sidebar/Sidebar";
import Navbar from "./components/Navbar/Navbar";
import {
  Authentication,
  Home,
  Explore,
  Trending,
  Search,
  Video,
  Profile,
  NoServerResponse,
  ServerError,
  Unauthorized,
  NoResourceFound,
  NoTFoundPage,
  Subscriptions,
  CreateVideo,
  UpdateVideo,
  UpdateProfile,
  Settings,
  Notifications,
  AdminDashboard,
} from "../";
import ROLES_LIST from "../../utils/roles_list";
import style from "./MainContent.module.css";

const MainContent = ({ socket }) => {
  return (
    <div className={style.main_content}>
      <Sidebar />

      <section className={style.current_page}>
        <Navbar />

        <Routes>
          {/* Public Routes */}
          <Route path="/authentication" element={<Authentication />} />
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/Search" element={<Search />} />
          <Route path="/videos/:videoId" element={<Video socket={socket} />} />
          <Route path="/users/:userId" element={<Profile socket={socket} />} />

          {/* Error Handler Routes */}
          <Route path="/noServerResponse" element={<NoServerResponse />} />
          <Route path="/serverError" element={<ServerError />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/noResourceFound" element={<NoResourceFound />} />
          <Route path="*" element={<NoTFoundPage />} />

          {/* Protected Routes only can be accessed by verified user */}
          <Route element={<RequireAuth allowedRoles={[ROLES_LIST.User]} />}>
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/createVideo" element={<CreateVideo />} />
            <Route path="/videos/:videoId/update" element={<UpdateVideo />} />
            <Route path="/users/:userId/update" element={<UpdateProfile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/:tab" element={<Settings />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Protected Routes only can be accessed by admins */}
          <Route element={<RequireAuth allowedRoles={[ROLES_LIST.Admin]} />}>
            <Route path="/adminDashboard" element={<AdminDashboard />} />
            <Route path="/adminDashboard/:tab" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </section>

      {/* Toast Container with its props */}
      <ToastContainerWithProps />

      {/* Server First Request Loading Message */}
      <FirstReqLoadingMsg />
    </div>
  );
};

export default MainContent;
