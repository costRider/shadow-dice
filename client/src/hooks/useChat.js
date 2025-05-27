import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from './useSocket';

/**
 * useChat hook for lobby or room chat
 * @param {'lobby'|'room'} chatType - 타입 ('lobby' or 'room')
 * @param {string|null} roomId - 방 채팅일 경우 roomId
 */
export const useChat = (chatType = 'lobby', roomId = null, user) => {
    const [messages, setMessages] = useState([]);
    const messagesEndRef = useRef(null);
    const { socket, isConnected, connect } = useSocket();

    // 1) 메시지 추가 유틸리티
    const addMessage = useCallback((message) => {
        setMessages(prev => [
            ...prev,
            { ...message, id: message.id ?? Date.now() }
        ]);
    }, []);

    // 2) 시스템 메시지 추가
    const addSystemMessage = useCallback((text) => {
        addMessage({
            username: '시스템',
            message: text,
            timestamp: Date.now(),
            type: 'system'
        });
    }, [addMessage]);

    // 3) 메시지 전송
    const sendMessage = useCallback((text) => {
        const content = text?.trim();
        if (!socket || !isConnected || !content) return false;

        const eventName = chatType === 'lobby'
            ? 'chat:lobby:send'
            : 'chat:room:send';

        const data = chatType === 'lobby'
            ? { message: content, user }
            : { roomId, message: content, user };

        socket.emit(eventName, data);
        return true;
    }, [socket, isConnected, chatType, roomId, user]);

    // 4) 소켓 연결 & 리스너 설정
    useEffect(() => {
        // 최초 진입 시 소켓 연결
        /* if (!isConnected) {
             console.log('Connecting to chat socket...');
             connect();
         }*/
        if (!isConnected) return;              // ← only consume

        if (!socket) return;

        const eventKey = chatType === 'lobby'
            ? 'chat:lobby:message'
            : 'chat:room:message';

        const handler = (msg) => {
            if (chatType === 'room' && msg.roomId !== roomId) return;
            addMessage(msg);
        };

        socket.on(eventKey, handler);
        return () => {
            socket.off(eventKey, handler);
        };
    }, [socket, isConnected, connect, chatType, roomId, addMessage]);

    // 5) 자동 스크롤
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 6) 메시지 초기화
    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    return {
        messages,
        sendMessage,
        addSystemMessage,
        clearMessages,
        messagesEndRef,
        isConnected,
    };
};
export default useChat;
