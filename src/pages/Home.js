import { v4 as uuidV4 } from "uuid";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState("");
  const [username, setUsername] = useState("");

  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    toast.success("Create a new room");
  };

  const joinRoom = () => {
    if (!roomId || !username) {
      toast.error("Room ID & Username required");
      return;
    }

    // redirect
    navigate(`/editor/${roomId}`, {
      state: {
        username,
      },
    });
  };

  // clicking enter key feature 
  const handlInputEnter = (e) => {
    if(e.code === 'Enter') {
      joinRoom();
    }
  }

  return (
    <div className="homePageWrapper">
      <div className="formWrapper">
        <img
          src="/code-sync.png"
          alt="code-sync-language"
          className="homePageLogo"
        />
        <h4 className="mainLabel">Paste invitation ROOM ID</h4>
        <div className="inputGroup">
          <input
            type="text"
            className="inputBox"
            placeholder="ROOM ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            onKeyUp={handlInputEnter}
          />
          <input
            type="text"
            className="inputBox"
            placeholder="USERNAME"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyUp={handlInputEnter}
          />
          <button className="btn joinBtn" onClick={joinRoom}>
            Join
          </button>
          <span className="createInfo">
            If you don't have an invite then create &nbsp;
            <a href="/" onClick={createNewRoom} className="createBtn">
              new room
            </a>
          </span>
        </div>
      </div>
      <footer>
        <h4>
          Built with &#128155; by <a href="">Coder</a>
        </h4>
      </footer>
    </div>
  );
};

export default Home;
