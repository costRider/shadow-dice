import React, { useState, useContext } from 'react';
import { Send } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { UserContext } from "@/context/UserContext";

const FixedChatBox = ({
    chatType = 'lobby',
    roomId = null,
    className = ''
}) => {
    const [newMessage, setNewMessage] = useState('');
    const { user } = useContext(UserContext);

    const {
        messages,
        sendMessage,
        messagesEndRef,
        isConnected
    } = useChat(chatType, roomId);

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        if (sendMessage(newMessage)) {
            setNewMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={`h-full flex flex-col bg-white ${className}`}>

            {/* 채팅 헤더 */}
            <div className="flex-shrink-0 px-3 py-2 bg-gray-50 border-b flex items-center justify-between">
                <span className="font-medium text-gray-700 text-sm">💬 채팅</span>
                <div className="flex items-center gap-1 text-xs">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className="text-gray-500">{isConnected ? '연결됨' : '연결 끊김'}</span>
                </div>
            </div>

            {/* 메시지 목록 */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-4">
                        채팅을 시작해보세요!
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`${msg.type === 'system'
                                ? 'text-center'
                                : msg.userId === user.id
                                    ? 'text-right'
                                    : 'text-left'
                                }`}
                        >
                            {msg.type === 'system' ? (
                                <div className="text-xs text-gray-500 italic px-2 py-1">
                                    {msg.message}
                                </div>
                            ) : (
                                <div className={`inline-block max-w-[70%] ${msg.userId === user.id
                                    ? 'bg-blue-500 text-white rounded-l-lg rounded-tr-lg'
                                    : 'bg-white border rounded-r-lg rounded-tl-lg shadow-sm'
                                    } p-2`}>
                                    {msg.userId !== user.id && (
                                        <div className="text-xs font-medium mb-1 text-gray-600">
                                            {msg.username}
                                        </div>
                                    )}
                                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                        {msg.message}
                                    </div>
                                    <div className={`text-xs mt-1 opacity-70 ${msg.userId === user.id ? 'text-blue-100' : 'text-gray-500'
                                        }`}>
                                        {formatTime(msg.timestamp)}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* 메시지 입력 */}
            <div className="flex-shrink-0 p-2 border-t bg-white">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="메시지 입력..."
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        disabled={!isConnected}
                        maxLength={300}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || !isConnected}
                        className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                        <Send size={14} />
                    </button>
                </div>
                {/* 글자 수 & 연결 상태 */}
                <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
                    <span>{newMessage.length}/300</span>
                    {!isConnected && <span className="text-red-500">연결 끊김</span>}
                </div>
            </div>
        </div>
    );
};
export default FixedChatBox;