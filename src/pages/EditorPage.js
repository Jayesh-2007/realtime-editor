// import { useEffect, useState, useRef } from "react";
// import Client from "../components/Client.js";
// import Editor from "../components/Editor.js";
// import ACTIONS from "../Actions.js";
// import { initSocket } from "../socket.js";
// import {
//   useLocation,
//   useNavigate,
//   useParams,
//   Navigate,
// } from "react-router-dom";
// import { toast } from "react-hot-toast";

// const EditorPage = () => {
//   const [clients, setClients] = useState([]);

//   const { roomId } = useParams();
//   const socketRef = useRef(null);
//   const location = useLocation();
//   const reactNavigator = useNavigate();
//   // const [socketReady, setSocketReady] = useState(false); // ✅ state to trigger re-render

//   useEffect(() => {
//     const init = async () => {
//       socketRef.current = await initSocket();
//       //  setSocketReady(true); // ✅ trigger re-render once socket is ready
//       socketRef.current.on("connect_error", (err) => handleErrors(err));
//       socketRef.current.on("connect_failed", (err) => handleErrors(err));

//       function handleErrors(e) {
//         console.log("socket error", e);
//         toast.error("Socket connection failed, try again later.");
//         reactNavigator("/");
//       }

//       socketRef.current.emit(ACTIONS.JOIN, {
//         roomId,
//         username: location.state?.username,
//       });

//       // listening for joined event
//       socketRef.current.on(
//         ACTIONS.JOINED,
//         ({ clients, username, socketId }) => {
//           if (username !== location.state?.username) {
//             toast.success(`${username} joined the room.`);
//             console.log(`${username} joined`);
//           }
//           setClients([
//             ...new Map(clients.map((c) => [c.socketId, c])).values(),
//           ]);
//         }
//       );

//       // listing for disconnected
//       socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
//         toast.success(`${username} left the room.`);
//         setClients((prev) => {
//           return prev.filter((client) => client.socketId !== socketId);
//         });
//       });
//     };
//     init();
//     // ✅ cleanup
//     return () => {
//       if (socketRef.current) {
//         socketRef.current.disconnect();
//         socketRef.current.off(ACTIONS.JOINED);
//         socketRef.current.off(ACTIONS.DISCONNECTED);
//       }
//     };
//   }, [location.state?.username, reactNavigator, roomId]);

//   if (!location.state) {
//     return <Navigate to="/" />;
//   }

//   return (
//     <div className="mainWrap">
//       <div className="aside">
//         <div className="asideInner">
//           <div className="logo">
//             <img className="logoImg" src="/code-sync.png" alt="logo" />
//           </div>
//           <h3>Connected</h3>
//           <div className="clientsList">
//             {clients.map((client) => {
//               return (
//                 <Client key={client.socketId} username={client.username} />
//               );
//             })}
//           </div>
//         </div>
//         <button className="btn copyBtn">Copy ROOM ID</button>
//         <button className="btn leaveBtn">leave</button>
//       </div>
//       <div className="editorWrap">
//         {socketRef.current && <Editor socketRef={socketRef} roomId={roomId} />}
//       </div>
//     </div>
//   );
// };

// export default EditorPage;

/************************************************************* fixed code ******************************************** */

import { useEffect, useState, useRef } from "react";
import Client from "../components/Client.js";
import Editor from "../components/Editor.js";
import ACTIONS from "../Actions.js";
import { initSocket } from "../socket.js";
import {
  useLocation,
  useNavigate,
  useParams,
  Navigate,
} from "react-router-dom";
import { toast } from "react-hot-toast";

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
        if (socketRef.current) {
          socketRef.current.disconnect(); // ✅ ensure cleanup
        }
        reactNavigator("/");
      }

      // Join room
      socketRef.current.emit(ACTIONS.JOIN, {
        roomId,
        username: location.state?.username,
      });

      // ✅ Joined event
      socketRef.current.on(
        ACTIONS.JOINED,
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

      // ✅ Disconnected event
      socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
        toast.success(`${username} left the room.`);
        setClients((prev) =>
          prev.filter((client) => client.socketId !== socketId)
        );
      });
    };

    init();

    // ✅ cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
      }
    };
  }, [location.state?.username, reactNavigator, roomId]);

  // if user navigated here without username
  if (!location.state) {
    return <Navigate to="/" />;
  }

  // ✅ Copy Room ID
  const copyRoomId = async () => {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID copied!");
    } catch (err) {
      toast.error("Failed to copy Room ID");
      console.error(err);
    }
  };

  // ✅ Leave Room
  const leaveRoom = () => {
    reactNavigator("/");
  };

  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img className="logoImg" src="/code-sync.png" alt="logo" />
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        {/* ✅ hooked up buttons */}
        <button className="btn copyBtn" onClick={copyRoomId}>
          Copy ROOM ID
        </button>
        <button className="btn leaveBtn" onClick={leaveRoom}>
          Leave
        </button>
      </div>

      <div className="editorWrap">
        {socketRef.current && (
          <Editor socketRef={socketRef} roomId={roomId} />
        )}
      </div>
    </div>
  );
};

export default EditorPage;
