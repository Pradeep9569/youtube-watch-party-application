import { useState } from "react";

const css = `
.d3-input {
    background: #0b0c1f;
    color: #fff;
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 10px 14px;
    font-size: 14px;
    outline: none;
    box-shadow: inset 0 4px 10px rgba(0,0,0,0.65), 0 1px 0 rgba(255,255,255,0.08);
    transition: border-color .2s, box-shadow .2s;
}
.d3-input::placeholder { color: #7f82ab; }
.d3-input:focus {
    border-color: #8b7bff;
    box-shadow: inset 0 4px 10px rgba(0,0,0,0.65), 0 0 0 3px rgba(139,123,255,0.35);
}
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
@media (prefers-reduced-motion: reduce) { .d3-btn, .d3-input { transition: none; } }
`;

function ChatInput({ onSend , onTyping}) {

    const [text, setText] = useState("");

    const handleChange = (e) => {
        setText(e.target.value);

        onTyping();
    };

    const send = () => {

        if (!text.trim()) return;

        onSend(text);

        setText("");
    };

    return (
        <div style={{ display: "flex", gap: "10px", alignItems: "center", paddingBottom: "6px" }}>
            <style>{css}</style>

            <input
                type="text"
                className="d3-input"
                style={{ flex: 1, minWidth: 0 }}
                value={text}
                placeholder="Type message..."
                
                onChange={handleChange}
            />

            <button className="d3-btn" onClick={send}>
                Send
            </button>
        </div>
    );
}

export default ChatInput;
