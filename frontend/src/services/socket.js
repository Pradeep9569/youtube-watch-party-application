import { io } from "socket.io-client";
import { API_ORIGIN } from "../config";

// autoConnect is off: the server requires a JWT, so we connect only after login
// (WatchRoom calls socket.connect()). The token is read fresh on every connect attempt.
const socket = io(API_ORIGIN || undefined, {
  autoConnect: false,
  withCredentials: true,
  auth: (cb) => cb({ token: localStorage.getItem("token") }),
});

export default socket;
