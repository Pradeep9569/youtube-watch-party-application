import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

const css = `
.d3-loader {
    min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 40px;
    background: radial-gradient(circle at 50% 40%, #23265a, #0b0c1f 70%); color: #fff;
}
.d3-loader h2 { margin: 0; letter-spacing: 1px; text-shadow: 0 1px 0 #6a5cf0, 0 2px 0 #5a4ce0, 0 3px 0 #4a3cc0, 0 6px 10px rgba(0,0,0,0.5); }
.d3-cube-scene { perspective: 600px; width: 60px; height: 60px; position: relative; }
.d3-cube-scene::after {
    content: ""; position: absolute; left: -20px; right: -20px; bottom: -40px; height: 18px;
    background: radial-gradient(ellipse at center, rgba(106,92,240,0.55), rgba(0,0,0,0) 70%); filter: blur(5px);
}
.d3-cube { width: 60px; height: 60px; position: relative; transform-style: preserve-3d; animation: d3Spin 2.6s linear infinite; }
.d3-cube span {
    position: absolute; inset: 0;
    border: 2px solid rgba(255,255,255,0.75);
    background: rgba(139,123,255,0.28);
    box-shadow: inset 0 0 16px rgba(139,123,255,0.7);
}
.d3-cube span:nth-child(1) { transform: translateZ(30px); }
.d3-cube span:nth-child(2) { transform: rotateY(180deg) translateZ(30px); }
.d3-cube span:nth-child(3) { transform: rotateY(90deg) translateZ(30px); }
.d3-cube span:nth-child(4) { transform: rotateY(-90deg) translateZ(30px); }
.d3-cube span:nth-child(5) { transform: rotateX(90deg) translateZ(30px); }
.d3-cube span:nth-child(6) { transform: rotateX(-90deg) translateZ(30px); }
@keyframes d3Spin {
    from { transform: rotateX(-25deg) rotateY(0deg); }
    to   { transform: rotateX(-25deg) rotateY(360deg); }
}
@media (prefers-reduced-motion: reduce) { .d3-cube { animation: none; transform: rotateX(-25deg) rotateY(35deg); } }
`;

function Loader() {
    return (
        <div className="d3-loader">
            <style>{css}</style>
            <div className="d3-cube-scene">
                <div className="d3-cube">
                    <span /><span /><span /><span /><span /><span />
                </div>
            </div>
            <h2>Loading...</h2>
        </div>
    );
}

// Login / Register pages: logged-in users are sent straight to /home.
function PublicRoute({ children }) {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <Loader />;
    }

    if (user) {
        return <Navigate to="/home" replace />;
    }

    return children;
}

export default PublicRoute;
