const css = `
.d3-plist { perspective: 1000px; color: #fff; }
.d3-plist-title {
    margin: 0 0 14px;
    font-size: 18px;
    letter-spacing: .5px;
    text-shadow: 0 1px 0 #6a5cf0, 0 2px 0 #5a4ce0, 0 3px 0 #4a3cc0, 0 6px 10px rgba(0,0,0,0.5);
}
.d3-prow {
    display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;
    gap: 10px; margin-bottom: 14px; padding: 12px 14px;
    border-radius: 16px;
    background: linear-gradient(145deg, #25285a, #171937);
    transform-style: preserve-3d;
    transition: transform .25s cubic-bezier(.2,.8,.2,1);
    box-shadow:
        inset 1px 1px 0 rgba(255,255,255,0.12),
        0 1px 0 #0d0e24, 0 2px 0 #0d0e24, 0 3px 0 #0d0e24, 0 4px 0 #0d0e24, 0 5px 0 #0d0e24,
        0 14px 22px rgba(0,0,0,0.4);
}
.d3-prow:hover { transform: translateY(-3px) rotateX(4deg); }
.d3-who { display: flex; align-items: center; gap: 12px; }
.d3-avatar {
    width: 38px; height: 38px; border-radius: 50%;
    display: grid; place-items: center;
    font-weight: 700; color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    background: radial-gradient(circle at 30% 25%, #c9c2ff 0%, #7a6bff 45%, #3a2fa0 100%);
    box-shadow: inset -4px -6px 8px rgba(0,0,0,0.4), 0 6px 10px rgba(0,0,0,0.5);
}
.d3-badge {
    display: inline-block; margin-left: 8px; padding: 2px 10px;
    border-radius: 999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px;
    background: #3a3d6b; color: #d6d8ff;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.25), 0 2px 0 #1a1b3a;
}
.d3-badge--host { background: linear-gradient(180deg,#ffd166,#f4a62a); color: #3b2500; box-shadow: inset 0 1px 0 rgba(255,255,255,0.5), 0 2px 0 #b8741a; }
.d3-badge--moderator { background: linear-gradient(180deg,#4be3a4,#1fbf7f); color: #053b27; box-shadow: inset 0 1px 0 rgba(255,255,255,0.4), 0 2px 0 #12805a; }
.d3-actions { display: flex; flex-wrap: wrap; gap: 10px; padding-bottom: 4px; }
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
.d3-btn.d3-btn--sm { --d: 4px; padding: 7px 12px; font-size: 12px; border-radius: 10px; }
.d3-btn.d3-btn--green { --top: #4be3a4; --bot: #1fbf7f; --depth: #12805a; --fg: #053b27; text-shadow: none; }
.d3-btn.d3-btn--amber { --top: #ffd166; --bot: #f4a62a; --depth: #b8741a; --fg: #3b2500; text-shadow: none; }
.d3-btn.d3-btn--red   { --top: #ff7a8a; --bot: #f03e5a; --depth: #a3213a; }
@media (prefers-reduced-motion: reduce) { .d3-btn, .d3-prow { transition: none; } }
`;

function ParticipantList({
    participants,
    currentRole,
    onAssignRole,
    onRemoveParticipant
}) {

    return (
        <div className="d3-plist">
          <style>{css}</style>

          <h3 className="d3-plist-title"> Participants</h3>
          {
            participants.map((user) => (
                
                <div
                key={user.username}
                className="d3-prow">

                <div className="d3-who">
                 <div className="d3-avatar">
                    {(user.username || "?").charAt(0).toUpperCase()}
                 </div>

                 <div>
                    <strong>{user.username}</strong> 

                    <span className={`d3-badge d3-badge--${user.role}`}>
                        {user.role}
                    </span>
                 </div>
                </div>
                {

               currentRole === "host" && (
                <div className="d3-actions">
                    <button
                    className="d3-btn d3-btn--sm d3-btn--green"
                    onClick={() => 
                        onAssignRole(
                            user.username,
                            "moderator"
                        )
                    }
                    >
                     Make Moderator   
                    </button>

                    <button
                    className="d3-btn d3-btn--sm d3-btn--amber"
                    onClick={() => 
                        onAssignRole(
                            user.username,
                            "participant"
                        )
                    }
                    >
                        Make Participant
                    </button>

                    <button
                    className="d3-btn d3-btn--sm d3-btn--red"
                    onClick={() =>
                        onRemoveParticipant(
                            user.username
                        )
                    }>
                        Remove
                    </button>
                    </div>
               )    

                }
                </div>
            ))
          }  
        </div>
    );
}

export default ParticipantList;
