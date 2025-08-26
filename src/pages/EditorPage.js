import { useState } from "react";
import Client from "../components/Client.js";
import Editor from "../components/Editor.js";

const EditorPage = () => {
  const [clinets, setClients] = useState([
    { socketId: 1, username: "Mark K" },
    { socketId: 2, username: "John M" },
    { socketId: 3, username: "Byron" },
    { socketId: 4, username: "Sanyam" },
  ]);
  return (
    <div className="mainWrap">
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img className="logoImg" src="/code-sync.png" alt="logo" />
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clinets.map((client) => {
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
