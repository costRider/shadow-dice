import { useLocation, useNavigate } from "react-router-dom";

const GameScreen = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen w-screen bg-[#f0f4f8]">
      {/* 상단 75% */}
      <div className="flex" style={{ height: "75%" }}>
        {/* 좌측 15% - 플레이어 목록 */}
        <div className="w-[15%] border-r bg-white p-2 space-y-2">
          <h4 className="font-bold text-center">👥 좌측</h4>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 p-2 text-sm rounded text-center"
            >
              {i + 1}P - 캐릭터
            </div>
          ))}
        </div>

        {/* 중앙 70% */}
        <div className="w-[70%] flex flex-col border-x">
          {/* 상단 10% - 기능 버튼 */}
          <div className="h-[10%] border-b flex items-center justify-end px-4 bg-white space-x-4">
            <button
              onClick={() => navigate("/lobby")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              나가기
            </button>
            <button className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
              설정
            </button>
          </div>

          {/* 하단 90% - 게임 보드 */}
          <div className="h-[90%] bg-green-100 flex items-center justify-center">
            <span className="text-gray-500 text-lg">🎲 [게임 화면 자리]</span>
          </div>
        </div>

        {/* 우측 15% - 플레이어 목록 */}
        <div className="w-[15%] border-l bg-white p-2 space-y-2">
          <h4 className="font-bold text-center">👥 우측</h4>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 p-2 text-sm rounded text-center"
            >
              {i + 4}P - 캐릭터
            </div>
          ))}
        </div>
      </div>

      {/* 하단 25% */}
      <div className="flex" style={{ height: "25%" }}>
        {/* 미니맵 */}
        <div className="w-[20%] border-r bg-white flex flex-col items-center justify-center">
          <h4 className="font-bold mb-2">🗺 미니맵</h4>
          <div className="w-24 h-24 bg-green-300 rounded shadow-inner" />
        </div>

        {/* 채팅창 */}
        <div className="w-[60%] p-4 flex flex-col bg-white border-r">
          <div className="flex-1 overflow-y-auto text-sm space-y-2">
            <div className="bg-gray-200 px-3 py-1 rounded self-start">
              1P: 안녕하세요!
            </div>
            <div className="bg-blue-100 px-3 py-1 rounded self-end">
              나: 시작하자!
            </div>
          </div>
          <div className="mt-2 flex gap-2">
            <input
              className="flex-1 border px-3 py-2 rounded"
              placeholder="채팅 입력..."
            />
            <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
              전송
            </button>
          </div>
        </div>

        {/* 내 캐릭터 목록 */}
        <div className="w-[20%] p-4 bg-white">
          <h4 className="font-bold mb-2">🎮 내 캐릭터</h4>
          <ul className="space-y-2 text-sm">
            <li className="border p-2 rounded">말1 - 능력치</li>
            <li className="border p-2 rounded">말2 - 능력치</li>
            <li className="border p-2 rounded">말3 - 능력치</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GameScreen;
