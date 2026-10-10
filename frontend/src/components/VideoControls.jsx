import { useContext, useState } from "react";
import { SocketContext } from "./context/SocketContext";

function getYouTubeVideoId(input) {
    if (!input) return null;
    const trimmed = input.trim();

    // Raw ID
    if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) {
        return trimmed;
    }

    try {
        const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
        const hostname = url.hostname.replace("www.", "");

        if (hostname === "youtu.be") {
            return url.pathname.slice(1);
        }

        if (hostname === "youtube.com" || hostname === "m.youtube.com") {
            const videoId = url.searchParams.get("v");
            if (videoId) return videoId;
            const pathParts = url.pathname.split("/").filter(Boolean);
            if (pathParts.length && pathParts[0] === "embed") {
                return pathParts[1];
            }
        }
    } catch (error) {
        return null;
    }

    return null;
}


const css = `
.d3-deck {
    display: flex; flex-wrap: wrap; align-items: center; gap: 16px 12px;
    margin-top: 18px; padding: 18px 18px 22px;
    border-radius: 18px; color: #fff;
    background: linear-gradient(160deg, #22254f, #121330);
    transform: perspective(1200px) rotateX(6deg);
    transform-origin: top center;
    transition: transform .5s cubic-bezier(.2,.8,.2,1);
    box-shadow:
        inset 1px 1px 0 rgba(255,255,255,0.14),
        0 1px 0 #0d0e24, 0 2px 0 #0d0e24, 0 3px 0 #0d0e24, 0 4px 0 #0d0e24, 0 5px 0 #0d0e24, 0 6px 0 #0d0e24,
        0 18px 30px rgba(0,0,0,0.45);
}
.d3-deck:hover, .d3-deck:focus-within { transform: perspective(1200px) rotateX(0deg); }
.d3-input {
    flex: 1; min-width: 140px;
    background: #0b0c1f; color: #fff;
    border: 1px solid rgba(255,255,255,0.12); border-radius: 12px;
    padding: 10px 14px; font-size: 14px; outline: none;
    box-shadow: inset 0 4px 10px rgba(0,0,0,0.65), 0 1px 0 rgba(255,255,255,0.08);
    transition: border-color .2s, box-shadow .2s;
}
.d3-input::placeholder { color: #7f82ab; }
.d3-input:focus { border-color: #8b7bff; box-shadow: inset 0 4px 10px rgba(0,0,0,0.65), 0 0 0 3px rgba(139,123,255,0.35); }
.d3-btn {
    --top: #8b7bff; --bot: #6a5cf0; --depth: #4337b8; --fg: #fff; --d: 6px;
    position: relative; border: 0; cursor: pointer;
    padding: 10px 18px; border-radius: 12px;
    font: 600 14px/1 system-ui, sans-serif; color: var(--fg);
    background: linear-gradient(180deg, var(--top), var(--bot));
    text-shadow: 0 1px 0 rgba(0,0,0,0.25);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 var(--d) 0 var(--depth), 0 calc(var(--d) + 8px) 16px rgba(0,0,0,0.45);
    transform: translateY(0);
    transition: transform .12s, box-shadow .12s, filter .15s;
}
.d3-btn:hover:not(:disabled) {
    transform: translateY(-2px); filter: brightness(1.08);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 calc(var(--d) + 2px) 0 var(--depth), 0 calc(var(--d) + 12px) 20px rgba(0,0,0,0.5);
}
.d3-btn:active:not(:disabled) {
    transform: translateY(var(--d));
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.3), 0 0 0 var(--depth), 0 2px 4px rgba(0,0,0,0.4);
}
.d3-btn:disabled {
    cursor: not-allowed; opacity: .5; filter: grayscale(.7);
    transform: translateY(calc(var(--d) - 2px));
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 0 var(--depth);
}
.d3-btn:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
.d3-btn.d3-btn--green { --top: #4be3a4; --bot: #1fbf7f; --depth: #12805a; --fg: #053b27; text-shadow: none; }
.d3-btn.d3-btn--amber { --top: #ffd166; --bot: #f4a62a; --depth: #b8741a; --fg: #3b2500; text-shadow: none; }
.d3-btn.d3-btn--blue  { --top: #5cc8ff; --bot: #2f8cf0; --depth: #1b5fb0; }
@media (prefers-reduced-motion: reduce) { .d3-btn, .d3-input, .d3-deck { transition: none; } .d3-deck { transform: none; } }
`;

function VideoControls({ player, roomCode, role }) {

    const socket = useContext(SocketContext);

    const [newVideoId, setNewVideoId] = useState("");

    const disabled =
        role !== "host" &&
        role !== "moderator";

    const play = () => {

        if (!player) return;

        player.playVideo();

        socket.emit("play", {
            roomCode
        });

    };

    const pause = () => {

        if (!player) return;

        player.pauseVideo();

        socket.emit("pause", {
            roomCode
        });

    };

    const seekForward = () => {

        if (!player) return;

        const time = player.getCurrentTime() + 10;

        player.seekTo(time, true);

        socket.emit("seek", {
            roomCode,
            currentTime: time
        });

    };

    const changeVideo = () => {
        if (!newVideoId.trim()) return;

        const id = getYouTubeVideoId(newVideoId);
        if (!id) {
            alert("Please enter a valid YouTube video ID or URL.");
            return;
        }

        socket.emit("change_video", {
            roomCode,
            videoId: id
        });

        setNewVideoId("");
    };

    return (
        <div className="d3-deck">
            <style>{css}</style>

            <button
                className="d3-btn d3-btn--green"
                disabled={disabled}
                onClick={play}
            >
                &#9654; Play
            </button>

            <button
                className="d3-btn d3-btn--amber"
                disabled={disabled}
                onClick={pause}
            >
                &#10074;&#10074; Pause
            </button>

            <button
                className="d3-btn d3-btn--blue"
                disabled={disabled}
                onClick={seekForward}
            >
                +10 Seconds
            </button>

            <input
                type="text"
                className="d3-input"
                placeholder="YouTube Video ID"
                value={newVideoId}
                onChange={(e) => setNewVideoId(e.target.value)}
            />

            <button
                className="d3-btn"
                disabled={disabled}
                onClick={changeVideo}
            >
                Change Video
            </button>

        </div>
    );
}

export default VideoControls;
