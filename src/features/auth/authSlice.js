import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    clearUser: (state) => {
      state.user = null;
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = action.payload;
      }
    },
  },
});

export const { setUser, clearUser, updateUser } = authSlice.actions;

export default authSlice.reducer;
