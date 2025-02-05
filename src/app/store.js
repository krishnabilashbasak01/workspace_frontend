import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../features/auth/authSlice";
import socketSlice from "../features/socket/socketSlice.js";
import usersSlice from "../features/users/usersSlice.js";
import tasksInQueueSlice from "../features/task/task_inqueue.js"
export const store = configureStore({
  reducer: {
    auth: authSlice,
    socket: socketSlice,
    users: usersSlice,
    tasks_in_queue: tasksInQueueSlice
  },
});
