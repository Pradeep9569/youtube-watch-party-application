import {useState} from "react";
import{useNavigate} from "react-router-dom";
import api from "../services/api";

function CreateRoom() {
    const navigate = useNavigate();
    const[username , setUsername] = useState("");
    const[loading , setLoading] = useState(false);

    const createRoom = async() => {
        if(!username.trim()) {
            return alert("Please enter your username");
        }

        try {
            setLoading(true);

            const response = await api.post("/rooms/create" , {
              username,  
            });

            const room = response.data;

            navigate(`/room/${room.roomCode}` , {
                state: {
                    username,
                },
            });
        } catch (error) {
            console.error(error);

            alert(
                error.response?.data?.message || "Failed to create room."

            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
        style={{
            display: "flex",
            flexDirection:"column",
            gap:"15px",
            width:"350px",
            margin: "50px auto",
        }}>

          <h1>Create Watch Party</h1>  

          <input
          type="text"
          placeholder="Enter Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}/>

          <button
          onClick={createRoom}
          disabled={loading}>
            {loading ? "Creating..." : "Create Room"}
          </button>
        </div>
    );
}

export default CreateRoom;