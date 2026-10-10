export function canControl(role) {
    return role === "host" || role ==="moderator";
}

export function isHost(role) {
    return role === "host";
}