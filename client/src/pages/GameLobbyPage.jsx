import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import useGameLobby from "@/hooks/useGameLobby";
import { fetchRoomPlayers } from "@/services/rooms";
import { useRoom } from "@/context/RoomContext"
import userGameLobbyUsers from "@/hooks/userGameLobbyUsers";
import FixedChatBox from "@/components/lobby/ChatBox";

const GameLobbyPage = () => {

    const { leave } = useGameLobby();
    const location = useLocation();
    const navigate = useNavigate();
    const { gameroom,
        players,
        setRoom,
        setPlayers,
        setMyCharacter,
        setReady,
        loadPlayers, } = useRoom();
    const roomId = gameroom?.id;
    const room = location.state?.room;
    const [isLeaving, setIsLeaving] = useState(false);

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

    const handleExitToLobby = async () => {
        if (!room) return;
        setIsLeaving(true);
        try {
            console.log('룸:', roomId);
            await leave(roomId);
            // leave 성공 → 로비로 이동
            navigate("/lobby");
        } catch (err) {
            console.error("방 나가기 실패:", err);
            // 필요시 토스트 알림
        }
    };

    /*
        const toggleReady = async () => {
            const next = !isReady;
            await readyRoomAPI(roomId, user.userId, next);
            setIsReady(next);
        };
    */
    return (
        <div className="flex flex-col h-screen w-screen bg-gray-100">
            {/* 상단 75% */}
            <div className="flex" style={{ height: "75%" }}>
                {/* 좌측 45% */}
                <div className="w-[45%] flex flex-col border-r bg-white">
                    {/* 상단: 유저 목록 */}
                    <div className="h-[70%] p-4 border-b">
                        <h2 className="font-semibold mb-3">👥 유저 슬롯</h2>
                        <ul className="grid grid-cols-2 gap-2">
                            {[...Array(8)].map((_, i) => (
                                <li
                                    key={i}
                                    className="border rounded p-2 text-sm text-center bg-gray-50"
                                >
                                    {i + 1}P - 대기중
                                </li>
                            ))}
                        </ul>
                    </div>
                    {/* 하단: 방 정보 */}
                    <div className="h-[30%] p-4 text-sm">
                        <h3 className="font-semibold mb-2">📋 방 정보</h3>
                        <p>방 이름: {gameroom?.title}</p>
                        <p>맵: {gameroom?.selectedMap}</p>
                        <p>인원: {gameroom?.maxPlayers}명</p>
                        <p>형태: {gameroom?.isPrivate ? "🔒 비공개" : "🌐 공개"}</p>
                    </div>
                </div>

                {/* 우측 55% */}
                <div className="w-[55%] flex flex-col">
                    {/* 상단: 말 선택 */}
                    <div className="h-[90%] p-4 border-b overflow-auto">
                        <h2 className="font-semibold mb-2">🎯 선택 가능한 게임 말</h2>
                        <div className="grid grid-cols-3 gap-3">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="border p-3 rounded bg-white text-sm shadow"
                                >
                                    <p className="font-bold">말 {i + 1}</p>
                                    <p>스탯: ???</p>
                                    <p>스킬: ???</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* 하단: 버튼 영역 */}
                    <div className="h-[10%] flex items-center justify-between px-4 bg-white">
                        <div className="w-[90%]">
                            <button
                                onClick={() => {
                                    navigate("/game");
                                }}
                                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
                            >
                                준비 / 시작
                            </button>
                        </div>
                        <div className="w-[10%] text-right">
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
            </div>

            {/* 하단 25% */}
            <div className="flex h-[25%] border-t">
                {/* 좌측: 채팅창 */}
                <div className="w-[80%]">
                    <FixedChatBox chatType="room" roomId={roomId} className="h-full" />
                </div>

                {/* 우측: 접속자 목록 */}
                <div className="w-[20%] p-4 border-l text-sm bg-white overflow-y-auto">
                    <h4 className="font-semibold mb-2">현재 접속자</h4>
                    <ul className="space-y-1">
                        {players.map((player) => (
                            <li key={player.id} className="p-2 border rounded bg-white">
                                {player.nickname}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default GameLobbyPage;
