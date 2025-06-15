// src/pages/GamePage.jsx
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAvatar } from "@/context/AvatarContext";

const GamePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const room = location.state?.room;
    const players = room?.players || [];

    // AvatarContext 헬퍼
    const {
        partDepth,
        avatarsByGender,
        loadAvatars,
        getBodyLayer,
        getExpressionLayer,
    } = useAvatar();

    // 유저 세부정보 (avatar_code, avatar_gender 등)는 room.players 에 이미 포함되어 있다고 가정
    // (필요시 서버에서 `/api/users/:id` 로 추가 프로필을 가져와도 됩니다)

    // Mount 시점에 모든 성별의 아바타 메타를 미리 로드
    useEffect(() => {
        players.forEach((p) => loadAvatars(p.avatar_gender));
    }, [players, loadAvatars]);

    // 좌우 팀 나누기 (첫 N/2명 좌측, 나머지 우측)
    const half = Math.ceil(players.length / 2);
    const leftTeam = players.slice(0, half);
    const rightTeam = players.slice(half);

    // 아바타 레이어를 만드는 함수
    const makeLayers = (p) => {
        const meta = (avatarsByGender[p.avatar_gender] || []).find(a => a.code === p.avatar_code) || {};
        const bodyLayer = getBodyLayer(meta);
        const defaultItems = meta.defaultItems || [];
        // 여기서는 기본 표정만 씁니다. 랜덤/채팅 연동 표정이 필요하면 getExpressionLayer 호출
        const expLayer = getExpressionLayer(p.avatar_code, "default", 1, p.avatar_gender);

        // 중복 부위 제거 + depth 정렬
        const raw = [bodyLayer, ...defaultItems, expLayer];
        const unique = Array.from(
            raw.reduce((m, l) => m.has(l.part_code) ? m : m.set(l.part_code, l), new Map()).values()
        );
        return unique.sort((a, b) => (partDepth[a.part_code] || 0) - (partDepth[b.part_code] || 0));
    };

    // 렌더링 가능한 캐릭터 카드
    const CharacterCard = ({ player }) => {
        const layers = makeLayers(player);
        return (
            <div className="flex flex-col items-center mb-4">
                <div className="relative w-24 h-32 bg-gray-800 rounded overflow-hidden">
                    {layers.map(layer => (
                        <img
                            key={layer.id}
                            src={`/resources/avatar/${layer.image_path.replace(/\\/g, "/")}`}
                            alt={layer.part_code}
                            className="absolute inset-0 w-full h-full object-contain"
                            style={{ zIndex: partDepth[layer.part_code] || 0 }}
                            draggable={false}
                        />
                    ))}
                </div>
                <div className="mt-2 text-white text-sm">{player.nickname}</div>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-screen w-screen bg-[rgba(0,0,40,0.8)]">
            {/* 상단 75% */}
            <div className="flex" style={{ height: "75%" }}>
                {/* 좌측 15% - 좌측 팀 */}
                <div className="w-[15%] border-r border-blue-600 bg-[rgba(10,10,40,0.6)] p-2 overflow-auto">
                    <h4 className="font-bold text-center text-yellow-300 mb-2">👥 좌측 팀</h4>
                    {leftTeam.map(p => (
                        <CharacterCard key={p.id} player={p} />
                    ))}
                </div>

                {/* 중앙 70% - 게임 보드 & 기능 버튼 등 그대로 유지 */}
                <div className="w-[70%] flex flex-col border-x border-blue-600 bg-[rgba(10,10,40,0.6)]">
                    <div className="h-[10%] border-b border-blue-600 flex items-center justify-end px-4 bg-[rgba(20,20,80,0.7)] space-x-4">
                        <button
                            onClick={() => navigate("/lobby")}
                            className="px-4 py-2 bg-gradient-to-b from-blue-500 to-blue-700 text-white rounded"
                        >
                            나가기
                        </button>
                        <button className="px-4 py-2 bg-gradient-to-b from-gray-300 to-gray-400 text-black rounded">
                            설정
                        </button>
                    </div>
                    <div className="h-[90%] bg-[rgba(50,200,100,0.15)] flex items-center justify-center">
                        <span className="text-gray-300 text-lg">🎲 [게임 화면 자리]</span>
                    </div>
                </div>

                {/* 우측 15% - 우측 팀 */}
                <div className="w-[15%] border-l border-blue-600 bg-[rgba(10,10,40,0.6)] p-2 overflow-auto">
                    <h4 className="font-bold text-center text-yellow-300 mb-2">👥 우측 팀</h4>
                    {rightTeam.map(p => (
                        <CharacterCard key={p.id} player={p} />
                    ))}
                </div>
            </div>

            {/* 하단 25% - 미니맵, 채팅, 내 캐릭터 (기존 유지) */}
            {/* ... */}
        </div>
    );
};

export default GamePage;
