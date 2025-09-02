import { io } from "socket.io-client";

export const initSocket = async () => {
  const options = {
    forceNew: true,
    reconnectionAttempts: Infinity,
    timeout: 1000,
    transports: ["websocket"],
  };

  const socket = io(process.env.REACT_APP_BACKEND_URL, options);
  return socket;
};
