import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home";
import CreateRoom from "./pages/CreateRoom";
import JoinRoom from "./pages/JoinRoom";
import WatchRoom from "./pages/WatchRoom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";

function App() {
    return (
        <div style={{  minHeight: "100vh" }}>
            <BrowserRouter>
                <Routes>

                    <Route
                        path="/"
                        element={<Navigate to="/login" replace />}
                    />

                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />

                    <Route
                        path="/register"
                        element={
                            <PublicRoute>
                                <Register />
                            </PublicRoute>
                        }
                    />

                    <Route
                        path="/home"
                        element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/create"
                        element={
                            <ProtectedRoute>
                                <CreateRoom />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/join"
                        element={
                            <ProtectedRoute>
                                <JoinRoom />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/room/:roomCode"
                        element={
                            <ProtectedRoute>
                                <WatchRoom />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="*"
                        element={<Navigate to="/login" replace />}
                    />

                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;