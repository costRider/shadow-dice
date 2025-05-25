/*
export default function handleChat(io, socket) {
    // 로비 채팅
    socket.on('chat:lobby:send', (data) => {
        console.log('[Chat] lobby send:', data);
        io.emit('chat:lobby:message', {
            ...data,
            timestamp: Date.now(),
        });
    });

    // 룸 채팅
    socket.on('chat:room:send', ({ roomId, message, user }) => {
        console.log(`[Chat] room ${roomId} send:`, message);
        io.to(roomId).emit('chat:room:message', {
            roomId,
            ...message,
            timestamp: Date.now(),
        });
    });
}
*/

// server/src/socket/handlers/chat.js
// server/src/socket/handlers/chat.js

// 기존 함수 정의
function handleChat(io, socket) {
    socket.on('chat:lobby:send', ({ message, user }) => {
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
