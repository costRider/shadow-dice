import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import CreateRoomPopup from "@/components/CreateRoomPopup";
import PasswordPopup from "@/components/auth/PasswordPopup";
import { UserContext } from "@/context/UserContext";
import useRooms from "@/hooks/useRooms";

const LobbyPage = () => {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [showPasswordPopup, setShowPasswordPopup] = useState(false);
    const [roomToEnter, setRoomToEnter] = useState(null);

    const { rooms, create, join } = useRooms();

    const goToRoom = async (room) => {
        await join(room.id);
        navigate("/gamelobby", { state: { room } });
    };

    const handleRoomEnter = (room) => {
        if (room.status === "IN_PROGRESS") {
            alert("현재 게임이 진행 중인 방입니다.");
            return;
        }

        if (room.isPrivate) {
            setRoomToEnter(room);
            setShowPasswordPopup(true);
        } else {
            goToRoom(room);
        }
    };

    return (
        <div className="flex flex-col h-screen w-screen">
            {/* 상단: 방 목록 + 방 정보 */}
            <div className="flex h-[60%] border-b border-gray-300">
                <div className="w-[63%] border-r p-4 overflow-auto">
                    <h2 className="text-lg font-semibold mb-2">방 목록</h2>
                    <ul className="space-y-2">
                        {rooms.map((room) => (
                            <li
                                key={room.id}
                                onClick={() => setSelectedRoom(room)}
                                onDoubleClick={() => handleRoomEnter(room)}
                                className="cursor-pointer border p-2 rounded hover:bg-gray-100"
                            >
                                <p className="font-bold">{room.title}</p>
                                <p>
                                    {room.players.length} / {room.maxPlayers}명
                                </p>
                                <p>
                                    {room.isPrivate ? "🔒 비공개" : "🌐 공개"} | 상태: {room.status}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="w-[37%] p-4 overflow-auto">
                    <h2 className="font-semibold text-lg mb-2">방 정보</h2>
                    {selectedRoom ? (
                        <div>
                            <p><strong>방 이름:</strong> {selectedRoom.title}</p>
                            <p><strong>방장:</strong> {selectedRoom.hostNickname}</p>
                            <p><strong>인원:</strong> {selectedRoom.players.length} / {selectedRoom.maxPlayers}</p>
                            <p>
                                <strong>설명:</strong> {selectedRoom.isPrivate ? "🔒 비공개" : "🌐 공개"} | {selectedRoom.map}
                            </p>
                        </div>
                    ) : (
                        <p className="text-gray-500">방을 선택하면 정보가 표시됩니다.</p>
                    )}
                </div>
            </div>

            {/* 중단: 생성/입장 + 나가기 버튼 */}
            <div className="flex h-[15%] items-center justify-between px-6 border-b border-gray-300">
                <div className="space-x-4">
                    <button
                        onClick={() => setShowPopup(true)}
                        className="bg-green-500 px-6 py-3 rounded text-white hover:bg-green-600"
                    >
                        방 생성
                    </button>

                    <button
                        className={`${selectedRoom ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-300 cursor-not-allowed"
                            } px-6 py-3 rounded text-white`}
                        disabled={!selectedRoom}
                        onClick={() => handleRoomEnter(selectedRoom)}
                    >
                        방 입장
                    </button>
                </div>

                <button
                    className="text-sm text-red-500 hover:underline"
                    onClick={() => navigate("/")}
                >
                    ❌ 나가기
                </button>
            </div>

            {/* 하단: 채팅 + 접속자 목록 */}
            <div className="flex h-[25%]">
                <div className="w-[70%] border-r p-4 overflow-y-auto">💬 채팅창</div>
                <div className="w-[30%] p-4 overflow-y-auto">👤 접속자 목록</div>
            </div>

            {/* 방 생성 팝업 */}
            {showPopup && (
                <CreateRoomPopup
                    onClose={() => setShowPopup(false)}
                    onCreate={async (roomData) => {
                        await create(roomData);
                        setShowPopup(false);
                    }}
                />
            )}

            {/* 비밀번호 입력 팝업 */}
            {showPasswordPopup && (
                <PasswordPopup
                    onClose={() => setShowPasswordPopup(false)}
                    onSubmit={(inputPw) => {
                        if (inputPw === roomToEnter.password) {
                            setShowPasswordPopup(false);
                            goToRoom(roomToEnter);
                        } else {
                            alert("비밀번호가 틀렸습니다.");
                            setShowPasswordPopup(false);
                        }
                    }}
                />
            )}
        </div>
    );
};

export default LobbyPage;
