
import { updateUserStatus, getLobbyUsers } from '../../services/userModel.js';

function handleLobby(io, socket) {
    socket.on('enter-lobby', async (data) => {
        console.log('서버에서 enter-lobby 수신:', data);
        const { success, user } = data;
        console.log(`🔌 User ${user.nickname} (${user.id}) is entering the lobby...`);
        await updateUserStatus(user.id, 'LOBBY', socket.id);
        console.log(`🔌 User ${user.nickname} (${user.id}) entered the lobby with socket ID: ${socket.id}`);
        const users = await getLobbyUsers();
        console.log('🔌 Lobby users:', users);
        io.emit('lobby-users', users);
    });

    socket.on('leave-lobby', async (data) => {
        // …
        console.log('서버에서 leave-lobby 수신:', data);
        await updateUserStatus(data.id, 'OFFLINE', null);
        const users = await getLobbyUsers();
        io.emit('lobby-users', users);
        console.log(`🔌 User ${data.id} disconnected and status updated to OFFLINE`);
    });

    socket.on('disconnect', async () => {
        // …\


    });
}

export default handleLobby;

