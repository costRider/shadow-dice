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
