import React, { useState, useContext } from "react";
import { createRoomAPI } from "../services/rooms";
import { UserContext } from "../context/UserContext";

const CreateRoomPopup = ({ onClose, onCreate }) => {
  const { user } = useContext(UserContext);

  const [roomName, setRoomName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [selectedMap, setSelectedMap] = useState("기본맵");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    if (!roomName || maxPlayers < 2) {
      alert("방 제목과 인원을 확인해주세요.");
      return;
    }

    const newRoom = {
      title: roomName,
      map: selectedMap,
      maxPlayers,
      isPrivate,
      password: isPrivate ? password : "",
      hostId: user.id,
    };

    try {
      const res = await createRoomAPI(newRoom);
      if (res.room) {
        console.log("보내는 room 데이터:", newRoom);

        onCreate(res.room); // 부모에서 목록 갱신
      }
    } catch (err) {
      console.log("보내는 room 데이터:", newRoom);
      console.error("방 생성 실패", err);
    }
  };
  // 방 생성 후 부모 컴포넌트에 알림
  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[400px] bg-white border shadow-lg p-5 rounded z-30">
      <h2 className="text-lg font-semibold mb-4">🛠 방 만들기</h2>
      {/* 방 이름 */}
      <div className="mb-3">
        <label className="block mb-1 text-sm">방 이름</label>
        <input
          type="text"
          value={roomName}
          onChange={(e) => {
            setRoomName(e.target.value);
          }}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      {/* 최대 인원 */}
      <div className="mb-3">
        <label className="block mb-1 text-sm">최대 인원</label>
        <select
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
          className="w-full px-3 py-2 border rounded"
        >
          {[...Array(7)].map((_, i) => {
            const num = i + 2;
            return (
              <option key={num} value={num}>
                {num}명
              </option>
            );
          })}
        </select>
      </div>

      {/* 맵 선택 */}
      <div className="mb-3">
        <label className="block mb-1 text-sm">맵 선택</label>
        <button
          onClick={() =>
            setSelectedMap(selectedMap === "기본맵" ? "숲속맵" : "기본맵")
          }
          className="w-full px-3 py-2 border rounded bg-gray-100 hover:bg-gray-200"
        >
          선택된 맵: {selectedMap}
        </button>
      </div>

      {/* 공개/비공개 */}
      <div className="mb-3">
        <label className="block mb-1 text-sm">공개 여부</label>
        <div className="flex gap-2">
          <button
            className={`flex-1 border rounded py-2 ${!isPrivate ? "bg-blue-500 text-white" : "bg-gray-100"}`}
            onClick={() => setIsPrivate(false)}
          >
            공개
          </button>
          <button
            className={`flex-1 border rounded py-2 ${isPrivate ? "bg-blue-500 text-white" : "bg-gray-100"}`}
            onClick={() => setIsPrivate(true)}
          >
            비공개
          </button>
        </div>
      </div>

      {/* 비밀번호 입력 */}
      {isPrivate && (
        <div className="mb-3">
          <label className="block mb-1 text-sm">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      )}

      {/* 버튼 */}
      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm bg-gray-300 rounded hover:bg-gray-400"
        >
          닫기
        </button>
        <button
          onClick={handleSubmit}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          생성
        </button>
      </div>
    </div>
  );
};

export default CreateRoomPopup;
