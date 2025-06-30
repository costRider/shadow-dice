import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/context/ToastContext";
import { useState, useEffect } from "react";
import useGameLobby from "@/hooks/useGameLobby";
import { useRoom } from "@/context/RoomContext";
import useRooms from "@/hooks/useRooms";
import useGameLobbyUsers from "@/hooks/useGameLobbyUsers";
import FixedChatBox from "@/components/lobby/ChatBox";
import EditRoomModal from "@/components/gamelobby/EditRoomModal";
import UserProfileModal from "@/components/lobby/UserProfileModal";
import useAuth from "@/hooks/useAuth";

const GameLobbyPage = () => {
    const [isLeaving, setIsLeaving] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [selectedCharacters, setSelectedCharacters] = useState([]);

    const [profileId, setProfileId] = useState(null);

    const { user } = useAuth();
    const { leave, ready } = useGameLobby();
    const { updateRoom } = useRooms();               // useRooms 훅에서 가져온 updateRoom
    const location = useLocation();
    const navigate = useNavigate();
    const [showEditModal, setShowEditModal] = useState(false);

    const { gameroom, players, setRoom, characterList, loadPlayers, mapList } = useRoom();

    const roomId = gameroom?.id;
    const costLimit = gameroom?.costLimit;
    const userId = user?.id;
    const mapInfo = mapList.find((m) => m.id === gameroom?.map);
    //const room = location.state?.room;

    useEffect(() => {
        if (location.state?.room) {
            setRoom(location.state.room);
        } else if (!gameroom) {
            navigate("/lobby");
        }
    }, []);

    useEffect(() => {
        if (roomId) loadPlayers(roomId);
    }, [roomId]);

    const { handleChangeTeam, handleGameStart, gameStarted } = useGameLobbyUsers(roomId, userId);

    // 4) “옵션 변경” 버튼을 누른 뒤, 서버가 room-updated를 emit하면
    //    이 useEffect에서 “방 옵션이 바뀌었다”고 판단해 로컬 캐릭터/준비 상태를 초기화합니다.

    useEffect(() => {
        if (!roomId) return;
        // room-info-updated 이벤트에서 Context가 이미 setRoom(updatedRoom) 됐고
        // 여기서 gameroom이 바뀌는 순간을 포착하여 로컬 상태를 초기화합니다.
        setSelectedCharacters([]);
        setIsReady(false);
    }, [gameroom?.teamMode, gameroom?.costLimit]);

    const isHost = gameroom?.hostId === userId;

    useEffect(() => {
        if (!gameroom || !gameStarted) return;
        navigate("/game", { state: { room: gameroom } });
    }, [gameStarted, gameroom]);

    // 4) 옵션 변경 저장 핸들러
    const handleSaveOptions = async ({ mode: newTeamMode, costLimit: newCost }) => {
        try {
            await updateRoom(roomId, { mode: newTeamMode, costLimit: newCost });
            setShowEditModal(false);
        } catch (err) {
            console.error("옵션 변경 실패:", err);
        }
    };

    const handleToggleCharacter = (id) => {
        if (isReady) return;

        const targetChar = characterList.find((c) => c.id === id);
        if (!targetChar) return;

        // 이미 선택된 캐릭터라면 해제만 처리
        const isSelected = selectedCharacters.includes(id);
        if (isSelected) {
            setSelectedCharacters((prev) => prev.filter((cid) => cid !== id));
            return;
        }

        // 선택하려는 캐릭터의 개별 Cost 검사
        if (costLimit !== null && targetChar.cost > costLimit) {
            toast(`⚠️ 이 캐릭터의 Cost(${targetChar.cost})가 제한(${costLimit})을 초과합니다!`);
            return;
        }

        // 4개 초과 선택을 원치 않으면 기존 로직 유지
        if (selectedCharacters.length >= 4) return;

        setSelectedCharacters((prev) => [...prev, id]);
    };

    const totalCost = selectedCharacters.reduce((sum, id) => {
        const ch = characterList.find((c) => c.id === id);
        return sum + (ch?.cost || 0);
    }, 0);

    const handleExitToLobby = async () => {
        if (!gameroom) return;
        setIsLeaving(true);
        try {
            await leave(roomId);
            navigate("/lobby");
        } catch (err) {
            console.error("방 나가기 실패:", err);
        }
    };

    const toggleReady = async () => {
        if (!roomId) return;

        const next = !isReady;
        await ready({
            roomId,
            userId,
            characterIds: selectedCharacters,
            isReady: next,
        });
        setIsReady(next);
        if (next) {
            handleGameStart(roomId); // 이 함수가 socket.emit(...) 호출해야 함
        }
    };

    const CharacterRow = ({ char, isSelected, onToggle }) => (
        <div
            className={`flex items-center justify-between px-3 py-1 rounded text-xs border 
      ${isSelected
                    ? "bg-[rgba(10,50,150,0.3)] border-blue-400"
                    : "bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)]"
                }`}
        >
            <div className="flex-1 font-medium text-white">{char.name}</div>
            <div className="w-16 text-center text-blue-200">Cost: {char.cost}</div>
            <div className="w-12 text-center text-blue-200">👟: {char.move}</div>
            <div className="w-12 text-center text-blue-200">⚔️: {char.attack}</div>
            <div className="w-12 text-center text-blue-200">🛡: {char.def}</div>
            <div className="w-12 text-center text-blue-200">📖: {char.int}</div>
            <div className="w-16 text-center text-gray-300">타입:{char.type}</div>
            <button
                onClick={() => onToggle(char.id)}
                className={`px-2 py-1 ml-2 rounded text-white text-xs ${isSelected
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-blue-500 hover:bg-blue-600"
                    } shadow`}
            >
                {isSelected ? "취소" : "선택"}
            </button>
        </div>
    );

    return (
        <div className="flex flex-col h-screen w-screen bg-[rgba(0,0,40,0.8)]">
            <div className="flex" style={{ height: "70%" }}>
                {/* 좌측 유저 슬롯 패널 */}
                <div className="w-[45%] flex flex-col border-r border-blue-600 bg-[rgba(10,10,40,0.6)]">
                    <div className="h-[75%] p-4 border-b border-blue-600 overflow-auto">
                        <h2 className="font-semibold text-yellow-300 mb-3">👥 유저 슬롯</h2>
                        <div className="flex items-center justify-between font-semibold text-sm px-2 mb-2 text-blue-200">
                            <div className="w-1/3">닉네임</div>
                            <div className="w-1/3 text-center">💰Cost</div>
                            <div className="w-1/3 text-right">팀</div>
                        </div>
                        <div className="flex flex-col gap-2">
                            {players.map((player) => (
                                <div
                                    key={player.id}
                                    className="flex items-center justify-between border border-blue-500 rounded p-2 bg-[rgba(255,255,255,0.1)] text-sm"
                                >
                                    <div className="w-1/3 font-medium text-white">
                                        Player - {player.nickname}
                                        {player.isReady ? (
                                            <span className="ml-2 text-green-400 text-xs">
                                                🔋 준비 완료
                                            </span>
                                        ) : (
                                            <span className="ml-2 text-gray-400 text-xs">
                                                🪫 대기중..
                                            </span>
                                        )}
                                    </div>
                                    <div className="w-1/3 text-center">
                                        {player.isReady ? (
                                            <span className="ml-2 text-green-400 text-xs">
                                                {player.totalCost ?? 0}
                                            </span>
                                        ) : (
                                            <span className="ml-2 text-gray-400 text-xs">
                                                ⏳ 캐릭터 선택 중..
                                            </span>
                                        )}
                                    </div>
                                    <div className="w-1/3 text-right">
                                        {gameroom?.teamMode ? (
                                            <select
                                                className="border border-blue-400 rounded px-2 py-1 text-xs bg-[rgba(255,255,255,0.1)] text-white"
                                                value={player.team || "blue"}
                                                disabled={player.id !== userId || isReady}
                                                onChange={(e) =>
                                                    handleChangeTeam(player.id, e.target.value)
                                                }
                                            >
                                                <option value="blue">🔵 블루</option>
                                                <option value="red">🔴 레드</option>
                                            </select>
                                        ) : (
                                            <span className="text-gray-400 text-xs">⚪ 솔로</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {[...Array(8 - players.length)].map((_, i) => (
                                <div
                                    key={`empty-${i}`}
                                    className="flex items-center justify-between border border-blue-500 rounded p-2 bg-[rgba(255,255,255,0.05)] text-sm text-gray-400"
                                >
                                    <div className="w-1/3 font-medium">{players.length + i + 1}P - 대기중</div>
                                    <div className="w-1/3 text-center">--</div>
                                    <div className="w-1/3 text-right">--</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="h-[20%] p-4 text-sm text-white">
                        <div className="flex justify-between">
                            {/* 좌측: 방 정보 텍스트 */}
                            <div className="space-y-1">
                                <h3 className="font-semibold text-yellow-300 mb-2">📋 방 정보</h3>
                                <p>방 이름: {gameroom?.title}</p>
                                <p>
                                    맵: {mapInfo?.name || `ID: ${gameroom?.map}`}
                                    <br />
                                    <span className="text-xs text-blue-300">{mapInfo?.description}</span>
                                </p>
                                <p>인원: {gameroom?.maxPlayers}명</p>
                                <p>형태: {gameroom?.isPrivate ? "🔒 비공개" : "🌐 공개"}</p>
                            </div>

                            {/* 우측: 옵션 변경 버튼 + 팀전/솔로 + Cost 제한 */}
                            <div className="flex flex-col items-end space-y-2">
                                {/* 옵션 변경 버튼(호스트만) */}
                                {isHost && (
                                    <button
                                        onClick={() => setShowEditModal(true)}
                                        disabled={isReady}
                                        className="px-4 py-1 bg-gradient-to-b from-blue-500 to-blue-700 text-white rounded hover:scale-105 transition shadow-md text-sm"
                                    >
                                        옵션 변경
                                    </button>
                                )}

                                {/* 팀 모드 */}
                                <span className="font-medium">
                                    {gameroom?.teamMode ? "🔵 팀전" : "⚪ 솔로"}
                                </span>

                                {/* Cost 제한 */}
                                <span className="font-medium">
                                    Cost 제한: {costLimit === null ? "무제한" : `${costLimit} 이하`}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 우측 캐릭터 선택 패널 */}
                <div className="w-[55%] flex flex-col">
                    <div className="h-[55%] p-4 border-b border-blue-600 overflow-auto bg-[rgba(10,10,40,0.6)]">
                        <h2 className="font-semibold text-yellow-300 mb-2">🎯 보유 캐릭터</h2>
                        <div className="space-y-1">
                            {characterList
                                .filter((c) => !selectedCharacters.includes(c.id))
                                .map((char) => (
                                    <CharacterRow
                                        key={char.id}
                                        char={char}
                                        isSelected={false}
                                        onToggle={handleToggleCharacter}
                                    />
                                ))}
                        </div>
                    </div>
                    <div className="h-[35%] p-4 border-b border-blue-600 overflow-auto bg-[rgba(10,10,40,0.6)]">
                        <h3 className="font-semibold text-yellow-300 mb-2">
                            🎯 선택한 캐릭터 ({selectedCharacters.length} / 4, 총 Cost:{" "}
                            {totalCost})
                        </h3>
                        <div className="space-y-1">
                            {selectedCharacters.map((id) => {
                                const char = characterList.find((c) => c.id === id);
                                return (
                                    <CharacterRow
                                        key={id}
                                        char={char}
                                        isSelected={true}
                                        onToggle={handleToggleCharacter}
                                    />
                                );
                            })}
                        </div>
                    </div>
                    <div className="h-[10%] flex items-center justify-between px-4 bg-[rgba(10,10,40,0.6)]">
                        <button
                            onClick={toggleReady}
                            disabled={selectedCharacters.length === 0}
                            className={`px-6 py-2 rounded text-white font-semibold shadow-md transition ${isReady
                                ? "bg-yellow-500 hover:bg-yellow-600"
                                : "bg-green-500 hover:bg-green-600"
                                }`}
                        >
                            {isReady ? "준비 취소" : "준비 완료"}
                        </button>
                        <button
                            onClick={handleExitToLobby}
                            disabled={isLeaving}
                            className="text-red-400 hover:text-red-600 underline text-sm"
                        >
                            ❌ 나가기
                        </button>
                    </div>
                </div>
            </div>

            {/* 하단: 채팅 / 접속자 lists */}
            <div className="flex h-[35%] border-t border-blue-600">
                <div className="w-[80%] bg-[rgba(10,10,40,0.6)]">
                    <FixedChatBox chatType="room" roomId={roomId} className="h-full" />
                </div>

                <div className="w-[20%] p-4 overflow-y-auto bg-[rgba(10,10,40,0.6)]">
                    <h4 className="font-semibold text-yellow-300 mb-2">현재 접속자</h4>
                    <ul className="space-y-1">
                        {players.map((player) => (
                            <li
                                key={player.id}
                                tabIndex={0}
                                className="flex items-center space-x-2 cursor-pointer hover:bg-[rgba(50,50,90,0.7)] p-2 rounded transition"
                                onClick={() => setProfileId(player.id)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        setProfileId(player.id);
                                    }
                                }}
                            >
                                <span className="text-white">{player.nickname}</span>
                            </li>
                        ))}
                    </ul>
                    {!players.length && (
                        <p className="text-gray-400">현재 접속자가 없습니다.</p>
                    )}
                </div>
            </div>

            {/* 옵션 변경 모달 */}
            {showEditModal && (
                <EditRoomModal
                    initialMode={gameroom.teamMode}
                    initialCostLimit={gameroom.costLimit}
                    onClose={() => setShowEditModal(false)}
                    onSave={handleSaveOptions}
                />
            )}

            {/* 🎉 프로필 모달 */}
            {profileId && (
                <UserProfileModal
                    userId={profileId}
                    onClose={() => setProfileId(null)}
                />
            )}
        </div>
    );
};

export default GameLobbyPage;
