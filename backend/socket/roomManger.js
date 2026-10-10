const activeUsers = new Map() ;

/*
socket.id

{
roomCode,
username
}

*/

export function addUser(socketId , user) {
    activeUsers.set(socketId , user);

   
}

export function removeUser(socketId) {
    activeUsers.delete(socketId);
}

export function getUser(socketId) {
    return activeUsers.get(socketId);
}

export function updateRole(socketId , role){
    const user = activeUsers.get(socketId);

    if(user){
        user.role = role;
    }
}