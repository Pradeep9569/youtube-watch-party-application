import { useState } from "react";
import { useNavigate } from "react-router-dom";

function JoinRoom() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");

  const joinRoom = () => {
    if (!username.trim() || !roomCode.trim()) {
      return alert("Please enter both a room code and username.");
    }

    navigate(`/room/${roomCode.trim().toUpperCase()}`, {
      state: { username: username.trim() }
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "15px", width: "350px", margin: "50px auto" }}>
      <h1>Join Watch Party</h1>

      <input
        type="text"
        placeholder="Room Code"
        value={roomCode}
        onChange={(e) => setRoomCode(e.target.value)}
      />

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <button onClick={joinRoom}>Join Room</button>
    </div>
  );
}

export default JoinRoom;
