import YouTube from "react-youtube";
import { useRef } from "react";

const css = `
.d3-stage { perspective: 1800px; position: relative; padding: 10px 0 36px; }
.d3-frame {
    padding: 14px; border-radius: 22px;
    background: linear-gradient(145deg, #2b2e63, #14152f);
    transform: rotateX(4deg);
    transform-origin: 50% 100%;
    transition: transform .6s cubic-bezier(.2,.8,.2,1);
    box-shadow:
        inset 1px 1px 0 rgba(255,255,255,0.18),
        0 1px 0 #0b0c1e, 0 2px 0 #0b0c1e, 0 3px 0 #0b0c1e, 0 4px 0 #0b0c1e,
        0 5px 0 #0b0c1e, 0 6px 0 #0b0c1e, 0 7px 0 #0b0c1e, 0 8px 0 #0b0c1e,
        0 30px 50px rgba(0,0,0,0.5);
}
.d3-stage:hover .d3-frame { transform: rotateX(0deg); }
.d3-screen {
    border-radius: 12px; overflow: hidden; background: #000; line-height: 0;
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08), 0 0 26px rgba(139,123,255,0.35);
}
.d3-floor {
    position: absolute; left: 8%; right: 8%; bottom: 4px; height: 24px;
    background: radial-gradient(ellipse at center, rgba(106,92,240,0.6), rgba(0,0,0,0) 70%);
    filter: blur(6px); pointer-events: none;
}
@media (prefers-reduced-motion: reduce) { .d3-frame { transition: none; transform: none; } }
`;

function VideoPlayer({ videoId, onReady, onError }) {
    const playerRef = useRef(null);

    const handleReady = (event) => {
        console.log("YouTube Player Ready");

        playerRef.current = event.target;

        if (onReady) {
            onReady(event.target);
        }
    };

    const handleError = (event) => {
        console.error("YouTube Player Error:", event.data);

        let message = "An error occurred while loading the YouTube video.";

        switch (event.data) {
            case 2:
                message = "The request contained an invalid parameter. Please verify the video ID.";
                break;
            case 5:
                message = "The requested content cannot be played in an embedded player. Try a different video.";
                break;
            case 100:
                message = "The video requested was not found. It may have been removed or marked as private.";
                break;
            case 101:
            case 150:
                message = "The owner of the requested video does not allow it to be played here.";
                break;
        }

        if (onError) {
            onError(message, event.data);
            return;
        }

        alert(message);
    };

    const options = {
        width: "100%",
        height: "500",
        playerVars: {
            autoplay: 0,
            rel: 0,
            origin: window.location.origin,
        },
    };

    console.log("Current Video ID:" , videoId);

    return (
        <div className="d3-stage">
            <style>{css}</style>

            <div className="d3-frame">
                <div className="d3-screen">
                    <YouTube
                        videoId={videoId}
                        opts={options}
                        onReady={handleReady}
                        onError={handleError}
                        iframeClassName="youtube-player"
                    />
                </div>
            </div>

            <div className="d3-floor" />
        </div>
    );
}

export default VideoPlayer;
