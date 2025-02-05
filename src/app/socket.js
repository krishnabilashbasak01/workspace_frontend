import { io } from "socket.io-client";

let socket = null;
export const connectSocket = (url, options) => {
    if (!socket) {
        socket = io(url, options);
    }
    return socket;
};

export const getSocket = () => {
    if (!socket) {
        console.warn("Socket is not initialized.");
    }
    return socket;
};


// const socket = io("http://localhost:3000", {
//     transports: ["websocket"], // Optional, ensures WebSocket connection
// });
//
// export default socket;