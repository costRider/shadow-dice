// GameLobbyPage.jsx
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useGameLobby from "@/hooks/useGameLobby";
import { useRoom } from "@/context/RoomContext";
import userGameLobbyUsers from "@/hooks/userGameLobbyUsers";
import FixedChatBox from "@/components/lobby/ChatBox";
import useAuth from '@/hooks/useAuth';

const GameLobbyPage = () => {
    const { user } = useAuth();
    const { leave, ready } = useGameLobby();
    const location = useLocation();
    const navigate = useNavigate();
    const {
        gameroom,
        players,
        setRoom,
        setPlayers,
        characterList,
        setMyCharacters,
        setReady,
        loadPlayers,
    } = useRoom();

    const roomId = gameroom?.id;
    const userId = user?.id;
    const room = location.state?.room;
    const [isLeaving, setIsLeaving] = useState(false);
    const [isReady, setIsReady] = useState(false); // 준비 여부 상태 추가
    const [selectedCharacters, setSelectedCharacters] = useState([]);

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

    userGameLobbyUsers(roomId);

    const handleToggleCharacter = (id) => {
        if (isReady) return; // 준비 완료 상태에서는 캐릭터 선택 불가

        setSelectedCharacters((prev) => {
            if (prev.includes(id)) {
                return prev.filter((cid) => cid !== id);
            } else {
                if (prev.length >= 4) return prev;
                return [...prev, id];
            }
        });
    };

    const totalCost = selectedCharacters.reduce((sum, id) => {
        const ch = characterList.find((c) => c.id === id);
        return sum + (ch?.cost || 0);
    }, 0);

    const handleExitToLobby = async () => {
        if (!room) return;
        setIsLeaving(true);
        try {
            await leave(roomId);
            navigate("/lobby");
        } catch (err) {
            console.error("방 나가기 실패:", err);
        }
    };

    // 준비 상태 토글 함수
    const toggleReady = async () => {
        if (!roomId) return;

        const next = !isReady;
        await ready({
            roomId,
            userId,
            characterIds: selectedCharacters,
            isReady: next,
        });
        setIsReady(next); // 로컬 상태 변경도 반영 (선택 사항)
    };

    const CharacterRow = ({ char, isSelected, onToggle }) => (
        <div
            className={`flex items-center justify-between px-3 py-1 rounded text-xs border 
        ${isSelected ? 'bg-blue-100 border-blue-300' : 'bg-white hover:bg-gray-50'}`}
        >
            <div className="flex-1 font-medium">{char.name}</div>
            <div className="w-16 text-center">Cost: {char.cost}</div>
            <div className="w-12 text-center">👟: {char.move}</div>
            <div className="w-12 text-center">⚔️: {char.attack}</div>
            <div className="w-12 text-center">🛡: {char.def}</div>
            <div className="w-12 text-center">📖: {char.int}</div>
            <div className="w-16 text-center text-gray-500">타입:{char.type}</div>
            <button
                onClick={() => onToggle(char.id)}
                className={`px-2 py-1 ml-2 rounded text-white text-xs ${isSelected ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
            >
                {isSelected ? '취소' : '선택'}
            </button>
        </div>
    );

    return (
        <div className="flex flex-col h-screen w-screen bg-gray-100">
            {/* 상단 70% */}
            <div className="flex" style={{ height: "70%" }}>
                {/* 좌측 유저 슬롯 */}
                <div className="w-[45%] flex flex-col border-r bg-white">
                    <div className="h-[75%] p-4 border-b">
                        <h2 className="font-semibold mb-3">👥 유저 슬롯</h2>
                        <div className="flex items-center justify-between font-semibold text-sm px-2 mb-2 text-gray-600">
                            <div className="w-1/3">닉네임</div>
                            <div className="w-1/3 text-center">💰Cost</div>
                            <div className="w-1/3 text-right">팀</div>
                        </div>
                        <div className="flex flex-col gap-2">
                            {players.map((player, i) => (
                                <div key={player.id} className="flex items-center justify-between border rounded p-2 bg-gray-50 text-sm">
                                    <div className="w-1/3 font-medium">
                                        {i + 1}P - {player.nickname}
                                        {/* player.isReady가 1(true)이면 초록색 체크, 아니면 회색 대기 아이콘 */}
                                        {player.isReady ? (
                                            <span className="ml-2 text-green-500 text-xs">🔋 준비 완료</span>
                                        ) : (
                                            <span className="ml-2 text-gray-400 text-xs">🪫 대기중..</span>
                                        )}
                                    </div>
                                    <div className="w-1/3 text-center">
                                        {player.isReady ? (
                                            <span className="ml-2 text-green-500 text-xs">{player.totalCost ?? 0}</span>
                                        ) : (
                                            <span className="ml-2 text-gray-400 text-xs">⏳ 캐릭터 선택 중..</span>
                                        )}
                                    </div>
                                    <div className="w-1/3 text-right">
                                        <select className="border rounded px-2 py-1 text-xs" value={player.team || "solo"}>
                                            <option value="solo">⚪ 솔로</option>
                                            <option value="blue">🔵 블루</option>
                                            <option value="red">🔴 레드</option>
                                        </select>
                                    </div>
                                </div>
                            ))}
                            {[...Array(8 - players.length)].map((_, i) => (
                                <div key={`empty-${i}`} className="flex items-center justify-between border rounded p-2 bg-gray-100 text-sm text-gray-400">
                                    <div className="w-1/3 font-medium">{players.length + i + 1}P - 대기중</div>
                                    <div className="w-1/3 text-center">--</div>
                                    <div className="w-1/3 text-right">--</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="h-[20%] p-4 text-sm">
                        <h3 className="font-semibold mb-2">📋 방 정보</h3>
                        <p>방 이름: {gameroom?.title}</p>
                        <p>맵: {gameroom?.selectedMap}</p>
                        <p>인원: {gameroom?.maxPlayers}명</p>
                        <p>형태: {gameroom?.isPrivate ? "🔒 비공개" : "🌐 공개"}</p>
                    </div>
                </div>

                {/* 우측 캐릭터 선택 */}
                <div className="w-[55%] flex flex-col">
                    <div className="h-[55%] p-4 border-b overflow-auto">
                        <h2 className="font-semibold mb-2">🎯 보유 캐릭터</h2>
                        <div className="space-y-1">
                            {characterList.filter(c => !selectedCharacters.includes(c.id)).map(char => (
                                <CharacterRow key={char.id} char={char} isSelected={false} onToggle={handleToggleCharacter} />
                            ))}
                        </div>
                    </div>
                    <div className="h-[35%] p-4 border-b overflow-auto">
                        <h3 className="font-semibold mb-2">🎯 선택한 캐릭터 ({selectedCharacters.length} / 4, 총 Cost: {totalCost})</h3>
                        <div className="space-y-1">
                            {selectedCharacters.map(id => {
                                const char = characterList.find(c => c.id === id);
                                return <CharacterRow key={id} char={char} isSelected={true} onToggle={handleToggleCharacter} />;
                            })}
                        </div>
                    </div>
                    <div className="h-[10%] flex items-center justify-between px-4 bg-white">
                        <button
                            onClick={toggleReady}
                            disabled={selectedCharacters.length === 0}
                            className={`px-6 py-2 rounded text-white ${isReady ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
                        >
                            {isReady ? '준비 취소' : '준비 완료'}
                        </button>
                        <button
                            onClick={handleExitToLobby}
                            disabled={isLeaving}
                            className="text-red-500 hover:underline text-sm"
                        >
                            ❌ 나가기
                        </button>
                    </div>
                </div>
            </div>

            {/* 하단 채팅 / 접속자 */}
            <div className="flex h-[35%] border-t">
                <div className="w-[80%]">
                    <FixedChatBox chatType="room" roomId={roomId} className="h-full" />
                </div>
                <div className="w-[20%] p-4 border-l text-sm bg-white overflow-y-auto">
                    <h4 className="font-semibold mb-2">현재 접속자</h4>
                    <ul className="space-y-1">
                        {players.map(player => (
                            <li key={player.id} className="p-2 border rounded bg-white">{player.nickname}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default GameLobbyPage;
