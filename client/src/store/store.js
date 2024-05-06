import { configureStore } from "@reduxjs/toolkit";
import userSlice from "./slices/userSlice";
import notificationsSlice from "./slices/notificationsSlice";

const devToolsStatus =
  import.meta.env.VITE_NODE_ENV === "development" ? true : false;

const store = configureStore({
  reducer: {
    user: userSlice,
    notifications: notificationsSlice,
  },
  devTools: devToolsStatus,
});

export { store };
