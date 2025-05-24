import { updateUserStatus, getLobbyUsers } from '../../services/userModel.js';

export default function handleLobby(io, socket) {
    socket.on('enter-lobby', async (user) => {
        await updateUserStatus(user.id, 'LOBBY', socket.id);
        const users = await getLobbyUsers();
        io.emit('lobby-users', users);
    });

    socket.on('leave-lobby', async () => {
        // …
    });

    socket.on('disconnect', async () => {
        // …
    });
}
