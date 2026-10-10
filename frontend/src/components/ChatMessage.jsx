function ChatMessage({ message }) {
    return (
        <div
            style={{
                padding: "10px 14px",
                marginBottom: "12px",
                borderRadius: "14px",
                background: "linear-gradient(145deg, #2b2e63, #1c1e42)",
                color: "#e9e9ff",
                boxShadow:
                    "inset 1px 1px 0 rgba(255,255,255,0.14), 0 4px 0 #11122b, 0 10px 16px rgba(0,0,0,0.45)",
                animation: "d3MsgIn 0.4s cubic-bezier(.2,.8,.2,1) both",
                wordBreak: "break-word"
            }}
        >
            <strong style={{ color: "#b9b0ff", textShadow: "0 1px 0 rgba(0,0,0,0.5)" }}>
                {message.username}
            </strong>

            <p style={{ margin: "4px 0 6px", color: "#fff" }}>{message.text}</p>

            <small style={{ color: "#8c8fb8" }}>
                {new Date(message.time).toLocaleTimeString()}
            </small>
        </div>
    );
}

export default ChatMessage;
