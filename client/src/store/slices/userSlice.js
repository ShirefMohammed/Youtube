import { createSlice } from "@reduxjs/toolkit";

let persist = localStorage.getItem("persist");

if (persist !== "true" && persist !== "false") {
  localStorage.setItem("persist", true);
  persist = true;
} else if (persist === "true") {
  persist = true;
} else {
  persist = false;
}

const userSlice = createSlice({
  name: "userSlice",
  initialState: {
    persist: persist,
  },
  reducers: {
    setUser: (_, action) => {
      return action.payload;
    },
  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
