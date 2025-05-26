
// 기존 함수 정의
function handleChat(io, socket) {
    socket.on('chat:lobby:send', ({ message }) => {
        const user = socket.data.user;
        console.log(`[Chat] ${user.id}: ${message}`);
        io.emit('chat:lobby:message', {
            userId: user.id,
            username: user.nickname,
            avatar: user.avatar,
            message,
            timestamp: Date.now(),
        });
    });
    // ...룸 채팅 등
}

// 디폴트로 내보내기
export default handleChat;
