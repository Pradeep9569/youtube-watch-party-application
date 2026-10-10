import { useNavigate } from "react-router-dom";
import {useContext} from "react";
import { AuthContext } from "../components/context/AuthContext";

function Home() {
  const navigate = useNavigate();

  const{user , logout} = useContext(AuthContext);

  const handleLogout = () => {
        logout();
        navigate("/login");
    };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "420px", margin: "60px auto", padding: "24px", textAlign: "center" }}>
      <h1>Watch Party</h1>
      <p>Create or join a watch party room with friends.</p>
      <button onClick={() => navigate("/create")}>Create Room</button>
      <button onClick={() => navigate("/join")}>Join Room</button>

      {user && (
        <h3>
          Welcome , {user.username}
        </h3>
      )}

      {user && (
        <button onClick={handleLogout}>
          Logout
        </button>
      )}
    </div>
  );
}

export default Home;
