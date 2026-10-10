import { useState, useEffect, useContext, useRef, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import { SocketContext } from "../components/context/SocketContext";
import { AuthContext } from "../components/context/AuthContext";

import VideoPlayer from "../components/VideoPlayer";
import VideoControls from "../components/VideoControls";
import ParticipantList from "../components/ParticipantList";
import ChatBox from "../components/ChatBox";

function WatchRoom() {
    const socket = useContext(SocketContext);
    const { user } = useContext(AuthContext);

    const navigate = useNavigate();
    const { roomCode } = useParams();
    const location = useLocation();

    const currentUsername =
        location.state?.username || user?.username || "Guest";

    const [videoId, setVideoId] = useState("M7lc1UVf-VE");
    const [player, setPlayer] = useState(null);
    const [role, setRole] = useState("participant");
    const [participants, setParticipants] = useState([]);
    const [messages, setMessages] = useState([]);
    const [typingUser, setTypingUser] = useState("");

    const pendingSync = useRef(null);

    const applySync = useCallback((p, state) => {
        if (!p || !state) return;

        if (typeof state.currentTime === "number") {
            p.seekTo(state.currentTime, true);
        }

        if (state.isPlaying) {
            p.playVideo();
        } else {
            p.pauseVideo();
        }
    }, []);

    // Join room and reconnect safely.
    useEffect(() => {
        if (!socket || !roomCode) return;

        const joinRoom = () => {
            socket.emit("join_room", {
                roomCode,
                username: currentUsername,
            });
        };

        const handleError = ({ message } = {}) => {
            alert(message || "Unable to join the room.");
            navigate("/home");
        };

        const handleConnectError = (err) => {
            console.error("Socket connection error:", err.message);
        };

        socket.on("connect", joinRoom);
        socket.on("error_message", handleError);
        socket.on("connect_error", handleConnectError);

        if (socket.connected) {
            joinRoom();
        } else {
            socket.connect();
        }

        return () => {
            socket.off("connect", joinRoom);
            socket.off("error_message", handleError);
            socket.off("connect_error", handleConnectError);
            socket.disconnect();
        };
    }, [socket, roomCode, currentUsername, navigate]);

    // Receive initial room state, including state received before player readiness.
    useEffect(() => {
        if (!socket) return;

        const handleSyncState = (state = {}) => {
            if (state.videoId) {
                setVideoId(state.videoId);
            }

            if (state.role) {
                setRole(state.role);
            }

            if (Array.isArray(state.participants)) {
                setParticipants(state.participants);
            }

            if (typeof state.currentTime === "number") {
                if (player) {
                    const timer = setTimeout(() => {
                        applySync(player, state);
                    }, 300);

                    pendingSync.current = { timer: null, state };
                    return () => clearTimeout(timer);
                }

                pendingSync.current = { state };
            }
        };

        socket.on("sync_state", handleSyncState);

        return () => {
            socket.off("sync_state", handleSyncState);
        };
    }, [socket, player, applySync]);

    // Apply pending state when the YouTube player becomes ready.
    useEffect(() => {
        if (!player || !pendingSync.current) return;

        const pending = pendingSync.current;
        pendingSync.current = null;

        const timer = setTimeout(() => {
            applySync(player, pending.state);
        }, 300);

        return () => clearTimeout(timer);
    }, [player, applySync]);

    // Listen for live video and role events.
    useEffect(() => {
        if (!socket || !player) return;

        const handlePlay = () => player.playVideo();
        const handlePause = () => player.pauseVideo();

        const handleSeek = ({ currentTime } = {}) => {
            if (typeof currentTime === "number") {
                player.seekTo(currentTime, true);
            }
        };

        const handleChangeVideo = ({ videoId: nextVideoId } = {}) => {
            if (nextVideoId) {
                setVideoId(nextVideoId);
            }
        };

        const handleRoleAssigned = ({
            username,
            role: nextRole,
            participants: nextParticipants,
        } = {}) => {
            if (username === currentUsername && nextRole) {
                setRole(nextRole);
            }

            if (Array.isArray(nextParticipants)) {
                setParticipants(nextParticipants);
            }
        };

        socket.on("play", handlePlay);
        socket.on("pause", handlePause);
        socket.on("seek", handleSeek);
        socket.on("change_video", handleChangeVideo);
        socket.on("role_assigned", handleRoleAssigned);

        return () => {
            socket.off("play", handlePlay);
            socket.off("pause", handlePause);
            socket.off("seek", handleSeek);
            socket.off("change_video", handleChangeVideo);
            socket.off("role_assigned", handleRoleAssigned);
        };
    }, [player, socket, currentUsername]);

    // Participant and room events.
    useEffect(() => {
        if (!socket) return;

        const handleJoined = ({ participants: nextParticipants } = {}) => {
            if (Array.isArray(nextParticipants)) {
                setParticipants(nextParticipants);
            }
        };

        const handleLeft = ({ participants: nextParticipants } = {}) => {
            if (Array.isArray(nextParticipants)) {
                setParticipants(nextParticipants);
            }
        };

        const handleRemoved = ({ participants: nextParticipants } = {}) => {
            if (Array.isArray(nextParticipants)) {
                setParticipants(nextParticipants);
            }
        };

        const handleRemovedRoom = () => {
            alert("You were removed from the room.");
            navigate("/home");
        };

        socket.on("user_joined", handleJoined);
        socket.on("user_left", handleLeft);
        socket.on("participant_removed", handleRemoved);
        socket.on("removed_from_room", handleRemovedRoom);

        return () => {
            socket.off("user_joined", handleJoined);
            socket.off("user_left", handleLeft);
            socket.off("participant_removed", handleRemoved);
            socket.off("removed_from_room", handleRemovedRoom);
        };
    }, [socket, navigate]);

    // Chat messages.
    useEffect(() => {
        if (!socket) return;

        const handleChatMessage = (message) => {
            setMessages((previous) => [...previous, message]);
        };

        socket.on("chat_message", handleChatMessage);

        return () => {
            socket.off("chat_message", handleChatMessage);
        };
    }, [socket]);

    // Typing indicator.
    useEffect(() => {
        if (!socket) return;

        let timer;

        const handleTypingEvent = ({ username } = {}) => {
            if (!username || username === currentUsername) return;

            setTypingUser(username);

            clearTimeout(timer);

            timer = setTimeout(() => {
                setTypingUser("");
            }, 1000);
        };

        socket.on("typing", handleTypingEvent);

        return () => {
            clearTimeout(timer);
            socket.off("typing", handleTypingEvent);
        };
    }, [socket, currentUsername]);

    const assignRole = (username, nextRole) => {
        socket?.emit("assign_role", {
            roomCode,
            username,
            role: nextRole,
        });
    };

    const removeParticipant = (username) => {
        socket?.emit("remove_participant", {
            roomCode,
            username,
        });
    };

    const sendMessage = (text) => {
        if (typeof text !== "string" || !text.trim()) return;

        socket?.emit("send_message", {
            roomCode,
            username: currentUsername,
            text: text.trim(),
        });
    };

    const handleTyping = () => {
        socket?.emit("typing", {
            roomCode,
            username: currentUsername,
        });
    };

    const inviteLink = `${window.location.origin}/room/${roomCode}`;

    const copyText = async (text, label) => {
        try {
            await navigator.clipboard.writeText(text);
            alert(`${label} copied!`);
        } catch (error) {
            console.error("Clipboard error:", error);
            alert("Unable to copy. Please copy it manually.");
        }
    };

    useEffect(() => {
    document.body.style.background =
        "linear-gradient(145deg, rgb(37, 40, 90), rgb(23, 25, 55))";

    return () => {
        document.body.style.background = "";
    };
}, []);

    return (<div
  style={{
    maxWidth: "1100px",
    margin: "20px auto",
    
  }}
>
            <h2 style={{color: "whitesmoke" , fontSize:"40px"}}>YouTube Watch Party</h2>

            <h4 style={{color: "whitesmoke" , fontSize:"25px"}}>Room Code: {roomCode}</h4>

            <VideoPlayer
                videoId={videoId}
                onReady={setPlayer}
            />

            <VideoControls
                player={player}
                roomCode={roomCode}
                role={role}
            />

            <ParticipantList
                participants={participants}
                currentRole={role}
                onAssignRole={assignRole}
                onRemoveParticipant={removeParticipant}
            />

            <ChatBox
                messages={messages}
                onSend={sendMessage}
                onTyping={handleTyping}
                typingUser={typingUser}
            />

            <button className="d3-input"   style={{ backgroundColor:"lightgreen" , color: "black" , cursor:"pointer"}}
            onClick={() => copyText(roomCode, "Room code")}>
                Copy Room Code
            </button>

            <button className="d3-input"
                style={{ margin: 20 , backgroundColor:"lightblue", color:"black" , cursor:"pointer"}}
                onClick={() => copyText(inviteLink, "Invite link")}
            >
                Copy Invite Link
            </button>
            
        </div>
    );
}

export default WatchRoom;