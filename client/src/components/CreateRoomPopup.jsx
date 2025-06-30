// CreateRoomPopup.jsx
import React, { useState, useContext } from "react";
import useRooms from "@/hooks/useRooms";
import { UserContext } from "@/context/UserContext";
import { useRoom } from "@/context/RoomContext";
import { toast } from "@/context/ToastContext";
import { ArrowLeft, ArrowRight } from "lucide-react"; // Lucide 아이콘을 사용했다고 가정

const COST_OPTIONS = [null, 100, 120, 140, 160, 180];

const CreateRoomPopup = ({ onClose, onCreate }) => {
  const { user } = useContext(UserContext);
  const { createRoom } = useRooms();
  const { mapList } = useRoom();
  const [roomName, setRoomName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [teamMode, setTeamMode] = useState(false);
  const [selectedMapId, setSelectedMapId] = useState(mapList?.[0]?.id || 11);
  // costLimit 값은 COST_OPTIONS의 인덱스로 관리
  const [costIndex, setCostIndex] = useState(0); // 처음은 null (무제한)

  const costLimit = COST_OPTIONS[costIndex]; // 실제 방 생성 시 전달할 값

  // 화살표를 눌러 costIndex를 이전/다음으로 이동시키는 함수
  const prevCost = () => {
    setCostIndex((prev) => (prev === 0 ? COST_OPTIONS.length - 1 : prev - 1));
  };
  const nextCost = () => {
    setCostIndex((prev) => (prev === COST_OPTIONS.length - 1 ? 0 : prev + 1));
  };

  const handleSubmit = async () => {
    if (!roomName.trim()) {
      toast("방 제목을 입력해주세요.");
      return;
    }
    if (maxPlayers < 2) {
      toast("최소 2명 이상이어야 합니다.");
      return;
    }
    if (teamMode && maxPlayers % 2 !== 0) {
      toast("팀전은 짝수 인원이 필요합니다.");
      return;
    }

    setLoading(true);
    const newRoom = {
      title: roomName,
      map: selectedMapId,
      maxPlayers,
      isPrivate,
      password: isPrivate ? password : "",
      hostId: user.id,
      costLimit,     // 여기서 선택된 Cost 제한값(null 혹은 숫자)이 들어갑니다
      mode: teamMode, // 팀 모드 여부
    };

    try {
      const created = await createRoom(newRoom, user);
      onCreate(created);
      onClose();
    } catch (err) {
      console.error("방 생성 중 예외 발생:", err);
      toast("방 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* 반투명 블랙 오버레이 */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <div className="relative z-10 w-[400px] bg-[rgba(10,10,40,0.85)] border border-blue-500 shadow-lg p-6 rounded-xl">
        <h2 className="text-xl font-bold text-yellow-300 mb-4">🛠 방 만들기</h2>

        {/* 방 이름 */}
        <div className="mb-4">
          <label className="block mb-1 text-sm text-blue-200">방 이름</label>
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full px-3 py-2 bg-[rgba(255,255,255,0.1)] border border-blue-400 rounded text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* 최대 인원 */}
        <div className="mb-4">
          <label className="block mb-1 text-sm text-blue-200">최대 인원</label>
          <select
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-[rgba(255,255,255,0.1)] border border-blue-400 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[...Array(7)].map((_, i) => {
              const num = i + 2;
              return (
                <option
                  key={num}
                  value={num}
                  className="bg-[rgba(10,10,40,0.85)] text-white"
                >
                  {num}명
                </option>
              );
            })}
          </select>
        </div>

        {/* 맵 선택 */}
        <div className="mb-4">
          {/*
          <label className="block mb-1 text-sm text-blue-200">맵 선택</label>
          <button
            onClick={() =>
              setSelectedMap((prev) => (prev === "기본맵" ? "숲속맵" : "기본맵"))
            }
            className="w-full px-3 py-2 bg-[rgba(255,255,255,0.1)] border border-blue-400 rounded text-white hover:bg-[rgba(255,255,255,0.2)] transition focus:outline-none"
          >
            선택된 맵: {selectedMap}
          </button>
        </div>
          */}
          <label className="block mb-1 text-sm text-blue-200 ">🗺 맵 선택</label>
          <select
            value={selectedMapId}
            onChange={(e) => setSelectedMapId(Number(e.target.value))}
            className="w-full px-3 py-2 bg-[rgba(255,255,255,0.1)] border border-blue-400 rounded text-white hover:bg-[rgba(255,255,255,0.2)] transition focus:outline-none"
          >
            {mapList.map((map) => (
              <option
                key={map.id}
                value={map.id}
                className="bg-[rgba(20,20,60,1)] text-white"
              >
                {map.name}
              </option>
            ))}
          </select>
        </div>

        {/* 공개/비공개 */}
        <div className="mb-4">
          <label className="block mb-1 text-sm text-blue-200">공개 여부</label>
          <div className="flex gap-2">
            <button
              className={`flex-1 py-2 border rounded text-sm ${!isPrivate
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-[rgba(255,255,255,0.1)] text-blue-200 border-blue-400"
                } hover:scale-105 transition`}
              onClick={() => setIsPrivate(false)}
            >
              공개
            </button>
            <button
              className={`flex-1 py-2 border rounded text-sm ${isPrivate
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-[rgba(255,255,255,0.1)] text-blue-200 border-blue-400"
                } hover:scale-105 transition`}
              onClick={() => setIsPrivate(true)}
            >
              비공개
            </button>
          </div>
        </div>

        {/* 팀 모드 & Cost 제한 (한 줄에 배치) */}
        <div className="mb-4 flex items-center justify-between">
          {/* 팀 모드 체크박스 */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="teamMode"
              checked={teamMode}
              onChange={(e) => setTeamMode(e.target.checked)}
              className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="teamMode" className="text-sm text-blue-200">
              팀전
            </label>
          </div>

          {/* Cost 제한 선택 (좌/우 화살표) */}
          <div className="flex items-center gap-1">
            <label className="block mb-1 text-sm text-blue-200">💰 Cost 제한 - </label>
            <button
              onClick={prevCost}
              className="p-1 bg-[rgba(255,255,255,0.1)] border border-blue-400 rounded hover:bg-[rgba(255,255,255,0.2)] transition"
            >
              <ArrowLeft size={16} className="text-blue-200" />
            </button>
            <span className="px-2 text-sm text-white whitespace-nowrap">
              {costLimit === null ? "무제한" : `${costLimit} 이하`}
            </span>
            <button
              onClick={nextCost}
              className="p-1 bg-[rgba(255,255,255,0.1)] border border-blue-400 rounded hover:bg-[rgba(255,255,255,0.2)] transition"
            >
              <ArrowRight size={16} className="text-blue-200" />
            </button>
          </div>
        </div>

        {/* 비밀번호 (비공개일 때만) */}
        {isPrivate && (
          <div className="mb-4">
            <label className="block mb-1 text-sm text-blue-200">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[rgba(255,255,255,0.1)] border border-blue-400 rounded text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* 버튼 그룹 */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
          >
            닫기
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-4 py-2 rounded text-white font-semibold shadow ${loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
              } transition`}
          >
            {loading ? "생성 중..." : "생성"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomPopup;
