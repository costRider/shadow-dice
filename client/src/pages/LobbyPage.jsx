import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreateRoomPopup from "@/components/CreateRoomPopup";
import PasswordPopup from "@/components/auth/PasswordPopup";
import useRooms from "@/hooks/useRooms";
import useGameLobby from "@/hooks/useGameLobby";
import useAuth from "@/hooks/useAuth";
import useLobbyUsers from "@/hooks/useLobbyUsers";
import FixedChatBox from "@/components/lobby/ChatBox";
import ShopModal from '@/components/lobby/ShopModal';
import UserProfileModal from "@/components/lobby/UserProfileModal";
import AvatarRoomModal from "@/components/lobby/AvatarRoomModal";
import { toast } from "@/context/ToastContext";
import { useRoom } from "@/context/RoomContext"

const LobbyPage = () => {
    const [profileId, setProfileId] = useState(null);
    const navigate = useNavigate();
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [showShop, setShowShop] = useState(false);
    const [showPasswordPopup, setShowPasswordPopup] = useState(false);
    const [roomToEnter, setRoomToEnter] = useState(null);
    const [showAvatarRoom, setShowAvatarRoom] = useState(false);
    const { logout, user } = useAuth();
    const { rooms } = useRooms();
    const { loadMaps } = useRoom();
    const { join } = useGameLobby();
    /*const { loading: lobbyLoading } = useLobbyUsers();
    const { lobbyUsers } = useContext(UserContext);*/
    const { loading: lobbyLoading, lobbyUsers } = useLobbyUsers();
    const { mapList } = useRoom();
    const mapInfo = mapList.find(m => m.id === selectedRoom?.map);

    useEffect(() => {
        loadMaps(); // 맵 목록 로딩
    }, []);

    useEffect(() => {
        if (selectedRoom && !rooms.find((r) => r.id === selectedRoom.id)) {
            toast("🫰선택하신 방이 타노스 당했습니다.");
            setSelectedRoom(null);
        }
    }, [rooms, selectedRoom]);

    const goToRoom = async (room) => {
        await join(room.id);
        navigate("/gamelobby", { state: { room } });
    };

    const handleExit = async () => {
        await logout();
        navigate("/");
    };


    const handleOpenShop = () => {

        if (!user) {
            toast("로그인이 필요합니다.");
            return;
        }
        setShowShop(true);
    };

    const handleRoomEnter = (room) => {
        if (room.status === "IN_PROGRESS") {
            toast("✋이미 질펀하게 놀고 있는 방입니다.");
            return;
        }

        if ((room.players?.length ?? 0) >= room.maxPlayers) {
            toast("⚠️ 들어갈 자리가 없습니다!");
            return;
        }

        if (room.isPrivate) {
            setRoomToEnter(room);
            setShowPasswordPopup(true);
        } else {
            goToRoom(room);
        }
    };

    // 방 생성 직후 자동 입장
    const handleCreated = async (newRoom) => {
        setShowPopup(false);
        navigate("/gamelobby", { state: { room: newRoom } });
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-[rgba(0,0,40,0.8)]">
            {/* 상단: 방 목록 + 방 정보 */}
            <div className="flex h-[55%] border-b border-blue-600">
                {/* 좌측 패널: 방 목록 */}
                <div className="w-[63%] border-r border-blue-600 p-4 overflow-auto bg-[rgba(10,10,40,0.6)]">
                    <h2 className="text-lg font-semibold text-yellow-300 mb-2">방 목록</h2>
                    <ul className="space-y-2">
                        {rooms.map((room) => (
                            <li
                                key={room.id}
                                onClick={() => setSelectedRoom(room)}
                                onDoubleClick={() => handleRoomEnter(room)}
                                className={`cursor-pointer p-3 rounded border border-blue-500 hover:bg-[rgba(50,50,90,0.7)] transition ${selectedRoom?.id === room.id
                                    ? "bg-[rgba(50,50,90,0.7)] ring-2 ring-yellow-300"
                                    : "bg-[rgba(20,20,60,0.5)]"
                                    }`}
                            >
                                <p className="font-bold text-white">{room.title}</p>
                                <p className="text-sm text-blue-200">
                                    {(room.players?.length ?? 0)} / {room.maxPlayers}명 | {room.teamMode ? "팀전" : "싱글"} / 💰Cost 제한: {room.costLimit === null ? "무제한" : `${room.costLimit} 이하`}
                                </p>
                                <p className="text-xs text-blue-300">
                                    {room.isPrivate ? "🔒 비공개" : "🌐 공개"} | 상태: {room.status}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 우측 패널: 선택된 방 정보 */}
                <div className="w-[37%] p-4 overflow-auto bg-[rgba(10,10,40,0.6)]">
                    <h2 className="font-semibold text-lg text-yellow-300 mb-2">방 정보</h2>
                    {selectedRoom ? (
                        <div className="space-y-2 text-white">
                            <p>
                                <strong>방 이름:</strong> {selectedRoom.title}
                            </p>
                            <p>
                                <strong>방장:</strong> {selectedRoom.hostNickname}
                            </p>
                            <p>
                                <strong>인원:</strong> {selectedRoom.players.length} /{" "}
                                {selectedRoom.maxPlayers}
                            </p>
                            <p>
                                <strong>옵션:</strong>{selectedRoom.teamMode ? "팀전" : "싱글"} / 💰Cost 제한: {selectedRoom.costLimit === null ? "무제한" : `${selectedRoom.costLimit} 이하`}
                                {selectedRoom.isPrivate ? "🔒 비공개" : "🌐 공개"} |{" "}
                            </p>
                            <div>
                                <p><strong>맵:</strong> {mapInfo?.name ?? `설명: ${selectedRoom.description}`}</p>
                                {mapInfo?.image_path && (
                                    <img
                                        src={`/${mapInfo.image_path.replace(/^\/?/, "")}`}
                                        alt={mapInfo.name}
                                        className="mt-2 rounded border border-blue-500 shadow-md"
                                        style={{ width: "100%", maxHeight: "160px", objectFit: "cover" }}
                                    />
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-400">방을 선택하면 정보가 표시됩니다.</p>
                    )}
                </div>
            </div>

            {/* 중단: 생성/입장 + 나가기 버튼 */}
            <div className="flex h-[10%] items-center justify-between px-6 border-b border-blue-600 bg-[rgba(5,5,30,0.5)]">
                <div className="space-x-4">
                    <button
                        onClick={() => setShowPopup(true)}
                        className="bg-gradient-to-b from-green-500 to-green-700 text-white px-6 py-3 rounded-lg hover:scale-105 transition shadow-md"
                    >
                        방 생성
                    </button>

                    <button
                        className={`px-6 py-3 rounded-lg text-white ${selectedRoom
                            ? "bg-gradient-to-b from-blue-500 to-blue-700 hover:scale-105"
                            : "bg-gray-400 cursor-not-allowed"
                            } transition shadow-md`}
                        disabled={!selectedRoom}
                        onClick={() => selectedRoom && handleRoomEnter(selectedRoom)}
                    >
                        방 입장
                    </button>

                    <button
                        onClick={() => setShowAvatarRoom(true)}
                        className="bg-gradient-to-b from-pink-500 to-pink-700 text-white px-6 py-3 rounded-lg hover:scale-105 transition shadow-md"
                    >
                        🧍 아바타룸
                    </button>

                    <button
                        onClick={handleOpenShop}
                        className="bg-gradient-to-b from-yellow-400 to-yellow-600 text-white px-6 py-3 rounded-lg hover:scale-105 transition shadow-md"
                    >
                        🛒 상점
                    </button>
                </div>

                <button
                    className="text-sm text-red-400 hover:text-red-600 underline"
                    onClick={handleExit}
                >
                    ❌ 나가기
                </button>
            </div>

            {/* 하단: 채팅 + 접속자 목록 */}
            <div className="flex h-[35%]">
                <div className="w-[70%] border-r border-blue-600">
                    <FixedChatBox chatType="lobby" />
                </div>
                <div className="w-[30%] p-4 overflow-y-auto bg-[rgba(10,10,40,0.6)]">
                    <h3 className="font-semibold text-yellow-300 mb-2">👥 로비 접속자</h3>
                    <ul className="space-y-1">
                        {lobbyUsers.map((u) => (
                            <li
                                key={u.id}
                                role="button"
                                aria-label={`${u.nickname} 프로필 보기`}
                                className="flex items-center space-x-2 cursor-pointer"
                                tabIndex={0}
                                onClick={() => setProfileId(u.id)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        setProfileId(u.id);
                                    }
                                }}
                            >
                                {u.avatar && (
                                    <img
                                        src={u.avatar}
                                        className="w-6 h-6 rounded-full border border-blue-400"
                                    />
                                )}
                                <span className="text-white">{u.nickname}</span>
                            </li>
                        ))}
                    </ul>
                    {!lobbyLoading && lobbyUsers.length === 0 && (
                        <p className="text-gray-400">현재 접속자가 없습니다.</p>
                    )}
                </div>
            </div>
            {/* 아바타룸 모달 */}
            {showAvatarRoom && <AvatarRoomModal onClose={() => setShowAvatarRoom(false)} />}

            {/* 프로필 모달 */}
            {profileId && (
                <UserProfileModal
                    userId={profileId}
                    onClose={() => setProfileId(null)}
                />
            )}
            {showShop && (
                <ShopModal onClose={() => setShowShop(false)} />
            )}
            {/* 방 생성 팝업 */}
            {showPopup && (
                <CreateRoomPopup onClose={() => setShowPopup(false)} onCreate={handleCreated} />
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
                            toast("비밀번호가 틀렸습니다.");
                        }
                    }}
                />
            )}
        </div>
    );
};

export default LobbyPage;
