import { createSlice } from "@reduxjs/toolkit";

const notificationsSlice = createSlice({
  name: "notificationsSlice",
  initialState: [],
  reducers: {
    setNotifications: (_, action) => {
      return action.payload;
    },
    pushNotification: (state, action) => {
      return [action.payload, ...state];
    },
    deleteNotification: (state, action) => {
      return state.filter(
        (notification) => notification._id !== action.payload
      );
    },
    updateNotification: (state, action) => {
      return state.map((notification) =>
        notification._id !== action.payload?._id ? notification : action.payload
      );
    },
  },
});

export const {
  setNotifications,
  pushNotification,
  deleteNotification,
  updateNotification,
} = notificationsSlice.actions;
export default notificationsSlice.reducer;
