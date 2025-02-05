import { createSlice } from "@reduxjs/toolkit";

const socketSlice = createSlice({
    name: "socket",
    initialState: {
        connected: false, // Example metadata
    },
    reducers: {
        setSocketConnectionStatus:(state, action) => {
            state.connected = action.payload;
        }
    },
});

export const { setSocket, setSocketConnectionStatus } = socketSlice.actions;

export default socketSlice.reducer;