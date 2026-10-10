import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

const css = `
@keyframes d3MsgIn {
    from { opacity: 0; transform: perspective(600px) rotateX(-25deg) translateY(12px) translateZ(-30px); }
    to   { opacity: 1; transform: perspective(600px) rotateX(0) translateY(0) translateZ(0); }
}
@keyframes d3Dot {
    0%, 80%, 100% { transform: translateY(0); opacity: .45; }
    40%           { transform: translateY(-6px); opacity: 1; }
}
.d3-chat-scene { perspective: 1400px; width: fit-content; margin-top: 20px; }
.d3-chat-card {
    box-sizing: content-box;
    width: 350px;
    padding: 15px;
    border-radius: 20px;
    
    color: #fff;
    background: linear-gradient(145deg, #1f2247, #12132b);
    border: 1px solid rgba(255,255,255,0.1);
    transform-style: preserve-3d;
    transform: rotateX(3deg) rotateY(-5deg);
    transition: transform .5s cubic-bezier(.2,.8,.2,1);
    box-shadow:
        1px 1px 0 #0d0e24, 2px 2px 0 #0d0e24, 3px 3px 0 #0d0e24,
        4px 4px 0 #0d0e24, 5px 5px 0 #0d0e24, 6px 6px 0 #0d0e24,
        14px 22px 36px rgba(0,0,0,0.45),
        inset 1px 1px 0 rgba(255,255,255,0.14);
}
.d3-chat-scene:hover .d3-chat-card,
.d3-chat-card:focus-within { transform: rotateX(0deg) rotateY(0deg); }
.d3-chat-title {
    margin: 0 0 12px;
    font-size: 18px;
    letter-spacing: .5px;
    color: #fff;
    text-shadow: 0 1px 0 #6a5cf0, 0 2px 0 #5a4ce0, 0 3px 0 #4a3cc0, 0 6px 10px rgba(0,0,0,0.5);
}
.d3-chat-scroll {
    height: 300px;
    overflow-y: auto;
    margin-bottom: 10px;
    padding: 10px;
    border-radius: 14px;
    background: #0b0c1f;
    box-shadow: inset 0 4px 12px rgba(0,0,0,0.7), 0 1px 0 rgba(255,255,255,0.08);
    box-sizing: border-box;
    height: 300px;
}
.d3-chat-scroll::-webkit-scrollbar { width: 8px; }
.d3-chat-scroll::-webkit-scrollbar-thumb { background: #4337b8; border-radius: 8px; }
.d3-typing { display: flex; align-items: center; gap: 4px; margin: 6px 4px; color: #9a9dc9; font-size: 13px; }
.d3-dot { width: 7px; height: 7px; border-radius: 50%; background: #8b7bff; display: inline-block; animation: d3Dot 1s infinite; }
.d3-dot:nth-child(2) { animation-delay: .15s; }
.d3-dot:nth-child(3) { animation-delay: .3s; }
@media (prefers-reduced-motion: reduce) {
    .d3-chat-card { transition: none; transform: none; }
    .d3-dot { animation: none; }
}
`;

function ChatBox({ messages, onSend , onTyping , typingUser}) {

    return (
        <div className="d3-chat-scene">
            <style>{css}</style>

            <div className="d3-chat-card">
                <h3 className="d3-chat-title">Room Chat</h3>

                <div className="d3-chat-scroll">
                    {messages.map((message, index) => (
                        <ChatMessage
                            key={index}
                            message={message}
                        />
                    ))}

                    {typingUser && (
                        <p className="d3-typing">
                            <span className="d3-dot" />
                            <span className="d3-dot" />
                            <span className="d3-dot" />
                            {typingUser} is typing...
                        </p>
                    )}
                </div>

                <ChatInput
                    onSend={onSend}
                    onTyping={onTyping}
                />
            </div>
        </div>
    );
}

export default ChatBox;
