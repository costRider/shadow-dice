import React, { useState, useContext } from "react";
import { Send } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { UserContext } from "@/context/UserContext";

const FixedChatBox = ({ chatType = "lobby", roomId = null, className = "" }) => {
    const [newMessage, setNewMessage] = useState("");
    const user = useContext(UserContext).user || null;

    const { messages, sendMessage, messagesEndRef, isConnected } = useChat(
        chatType,
        roomId,
        user
    );

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;
        if (sendMessage(newMessage)) {
            setNewMessage("");
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className={`h-full flex flex-col bg-[rgba(10,10,40,0.6)] ${className}`}>
            {/* 채팅 헤더 */}
            <div className="flex-shrink-0 px-3 py-2 bg-[rgba(5,5,30,0.8)] border-b border-blue-600 flex items-center justify-between">
                <span className="font-medium text-blue-200 text-sm">💬 채팅</span>
                <div className="flex items-center gap-1 text-xs">
                    <div
                        className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"
                            }`}
                    ></div>
                    <span className="text-blue-200">
                        {isConnected ? "연결됨" : "연결 끊김"}
                    </span>
                </div>
            </div>

            {/* 메시지 목록 */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[rgba(10,10,40,0.4)]">
                {messages.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-4">
                        채팅을 시작해보세요!
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.type === "system"
                                    ? "justify-center"
                                    : msg.userId === user?.id
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                        >
                            {msg.type === "system" ? (
                                <div className="text-xs text-yellow-300 italic px-2 py-1">
                                    {msg.message}
                                </div>
                            ) : (
                                <div
                                    className={`max-w-[70%] p-2 rounded ${msg.userId === user?.id
                                            ? "bg-blue-500 text-white rounded-l-lg rounded-tr-lg"
                                            : "bg-[rgba(255,255,255,0.1)] text-white border border-blue-400 rounded-r-lg rounded-tl-lg shadow-sm"
                                        }`}
                                >
                                    {msg.userId !== user?.id && (
                                        <div className="text-xs font-medium mb-1 text-blue-200">
                                            {msg.username}
                                        </div>
                                    )}
                                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                        {msg.message}
                                    </div>
                                    <div
                                        className={`text-xs mt-1 opacity-70 ${msg.userId === user?.id ? "text-blue-100" : "text-blue-200"
                                            }`}
                                    >
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
            <div className="flex-shrink-0 p-3 border-t border-blue-600 bg-[rgba(5,5,30,0.8)]">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="메시지 입력..."
                        className="flex-1 px-3 py-2 bg-[rgba(255,255,255,0.1)] border border-blue-400 text-white placeholder-blue-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={!isConnected}
                        maxLength={300}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || !isConnected}
                        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                        <Send size={14} />
                    </button>
                </div>
                <div className="flex justify-between items-center mt-2 text-xs text-blue-200">
                    <span>{newMessage.length}/300</span>
                    {!isConnected && <span className="text-red-500">연결 끊김</span>}
                </div>
            </div>
        </div>
    );
};

export default FixedChatBox;
