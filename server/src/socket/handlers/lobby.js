
import { updateUserStatus, getLobbyUsers } from '../../services/userModel.js';
import { socketToUserMap } from '../socket.js';

function handleLobby(io, socket) {

    socket.on('enter-lobby', async (data) => {
        console.log('서버에서 enter-lobby 수신:', data);
        const { success, user } = data;
        console.log('🔌 enter-lobby user ID:', user.id);
        // 기존 연결된 소켓이 있으면
        if (socketToUserMap.has(user.id)) {
            const existingSocketId = socketToUserMap.get(user.id);
            console.log(`🔌 User ${user.nickname} (${user.id}) already connected with socket ID: ${existingSocketId}`);
            // 신규 접속 거부 
            socket.emit('error', { message: '중복 접속 입니다.' });
            return;
        }
        // 신규 소켓 연결 등록
        socketToUserMap.set(user.id, socket.id);
        // 사용자 ID 소켓 data에 저장
        socket.data.userId = user.id;
        socket.data.user = user; // 사용자 정보 저장
        socket.data.hasLeft = false; // 나간 상태 초기화
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
        if (socket.data.hasLeft) return; // 이미 나간 경우 중복 처리 방지
        socket.data.hasLeft = true; // 나간 상태로 표시
        socketToUserMap.delete(socket.data.userId); // 소켓 ID 제거
        await updateUserStatus(socket.data.userId, 'OFFLINE', null);
        const users = await getLobbyUsers();
        io.emit('lobby-users', users);
        console.log(`🔌 User ${socket.data.userId} disconnected and status updated to OFFLINE`);
    });

    socket.on('disconnect', async () => {
        // …\
        console.log('서버에서 disconnect 수신');
        // 소켓ID를 통해 사용자 ID를 조회
        const userId = socket.data.userId || socketToUserMap.get(socket.id);
        if (!userId || socket.data.hasLeft) {
            console.log('🔌 No user ID found in socket data or already left');
            return;
        }
        socket.data.hasLeft = true; // 나간 상태로 표시
        // 소켓 연결 해제 시 사용자 ID를 콘솔에 출력
        console.log(`🔌 User ID from socket data on disconnect: ${userId}`)

        if (userId) {
            socketToUserMap.delete(userId);
            await updateUserStatus(userId, 'OFFLINE', null);
            const users = await getLobbyUsers();
            io.emit('lobby-users', users);
            console.log(`🔌 User ${userId} disconnected and status updated to OFFLINE`);
        } else {
            console.log('🔌 No user ID found in socket data on disconnect');
        }

    });
}

export default handleLobby;

