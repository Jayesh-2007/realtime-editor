import { useEffect, useState, useRef } from "react";
import Client from "../components/Client.js";
import Editor from "../components/Editor.js";
import Actions from "../Actions.js";
import { initSocket } from "../socket.js";
import {
  useLocation,
  useNavigate,
  useParams,
  Navigate,
} from "react-router-dom";
import { toast } from "react-hot-toast";
import client from "react-dom/client";

const EditorPage = () => {
  const [clients, setClients] = useState([]);

  const { roomId } = useParams();
  const socketRef = useRef(null);
  const location = useLocation();
  const reactNavigator = useNavigate();
  useEffect(() => {
    const init = async () => {
      socketRef.current = await initSocket();
      socketRef.current.on("connect_error", (err) => handleErrors(err));
      socketRef.current.on("connect_failed", (err) => handleErrors(err));

      function handleErrors(e) {
        console.log("socket error", e);
        toast.error("Socket connection failed, try again later.");
        reactNavigator("/");
      }

      socketRef.current.emit(Actions.JOIN, {
        roomId,
        username: location.state?.username,
      });

      // listening for joined event
      socketRef.current.on(
        Actions.JOINED,
        ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room.`);
            console.log(`${username} joined`);
          }
          setClients([
            ...new Map(clients.map((c) => [c.socketId, c])).values(),
          ]);
        }
      );

      // listing for disconnected
      socketRef.current.on(Actions.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        setClients((prev) => {
          return prev.filter((client) => client.socketId != socketId);
        });
      });
    };
    init();
    // ✅ cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off(Actions.JOINED);
        socketRef.current.off(Actions.DISCONNECTED);
      }
    };
  }, []);

  if (!location.state) {
    return <Navigate to="/" />;
  }
  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img className="logoImg" src="/code-sync.png" alt="logo" />
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clients.map((client) => {
              return (
                <Client key={client.socketId} username={client.username} />
              );
            })}
          </div>
        </div>
        <button className="btn copyBtn">Copy ROOM ID</button>
        <button className="btn leaveBtn">leave</button>
      </div>
      <div className="editorWrap">
        <Editor />
      </div>
    </div>
  );
};

export default EditorPage;
