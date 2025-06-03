import { useLocation, useNavigate } from "react-router-dom";

const GamePage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-screen w-screen bg-[rgba(0,0,40,0.8)]">
            {/* 상단 75% */}
            <div className="flex" style={{ height: "75%" }}>
                {/* 좌측 15% - 플레이어 목록 */}
                <div className="w-[15%] border-r border-blue-600 bg-[rgba(10,10,40,0.6)] p-2 space-y-2 overflow-auto">
                    <h4 className="font-bold text-center text-yellow-300">👥 좌측</h4>
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-[rgba(255,255,255,0.1)] p-2 text-sm rounded text-center text-white hover:bg-[rgba(255,255,255,0.2)] transition"
                        >
                            {i + 1}P - 캐릭터
                        </div>
                    ))}
                </div>

                {/* 중앙 70% */}
                <div className="w-[70%] flex flex-col border-x border-blue-600 bg-[rgba(10,10,40,0.6)]">
                    {/* 상단 10% - 기능 버튼 */}
                    <div className="h-[10%] border-b border-blue-600 flex items-center justify-end px-4 bg-[rgba(20,20,80,0.7)] space-x-4">
                        <button
                            onClick={() => navigate("/lobby")}
                            className="px-4 py-2 bg-gradient-to-b from-blue-500 to-blue-700 text-white rounded hover:scale-105 transition shadow-md"
                        >
                            나가기
                        </button>
                        <button className="px-4 py-2 bg-gradient-to-b from-gray-300 to-gray-400 text-black rounded hover:scale-105 transition shadow-md">
                            설정
                        </button>
                    </div>

                    {/* 하단 90% - 게임 보드 */}
                    <div className="h-[90%] bg-[rgba(50,200,100,0.15)] flex items-center justify-center">
                        <span className="text-gray-300 text-lg">🎲 [게임 화면 자리]</span>
                    </div>
                </div>

                {/* 우측 15% - 플레이어 목록 */}
                <div className="w-[15%] border-l border-blue-600 bg-[rgba(10,10,40,0.6)] p-2 space-y-2 overflow-auto">
                    <h4 className="font-bold text-center text-yellow-300">👥 우측</h4>
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-[rgba(255,255,255,0.1)] p-2 text-sm rounded text-center text-white hover:bg-[rgba(255,255,255,0.2)] transition"
                        >
                            {i + 4}P - 캐릭터
                        </div>
                    ))}
                </div>
            </div>

            {/* 하단 25% */}
            <div className="flex" style={{ height: "25%" }}>
                {/* 미니맵 */}
                <div className="w-[20%] border-r border-blue-600 bg-[rgba(10,10,40,0.6)] flex flex-col items-center justify-center">
                    <h4 className="font-bold mb-2 text-yellow-300">🗺 미니맵</h4>
                    <div className="w-24 h-24 bg-[rgba(50,200,100,0.3)] rounded shadow-inner" />
                </div>

                {/* 채팅창 */}
                <div className="w-[60%] p-4 flex flex-col bg-[rgba(10,10,40,0.6)] border-r border-blue-600">
                    <div className="flex-1 overflow-y-auto text-sm space-y-2">
                        <div className="bg-[rgba(255,255,255,0.1)] px-3 py-1 rounded self-start text-white">
                            1P: 안녕하세요!
                        </div>
                        <div className="bg-[rgba(0,100,200,0.2)] px-3 py-1 rounded self-end text-white">
                            나: 시작하자!
                        </div>
                    </div>
                    <div className="mt-2 flex gap-2">
                        <input
                            className="flex-1 border border-blue-400 px-3 py-2 rounded bg-[rgba(255,255,255,0.1)] text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="채팅 입력..."
                        />
                        <button className="px-4 py-2 bg-gradient-to-b from-blue-500 to-blue-700 text-white rounded hover:scale-105 transition shadow-md">
                            전송
                        </button>
                    </div>
                </div>

                {/* 내 캐릭터 목록 */}
                <div className="w-[20%] p-4 bg-[rgba(10,10,40,0.6)] overflow-auto">
                    <h4 className="font-bold mb-2 text-yellow-300">🎮 내 캐릭터</h4>
                    <ul className="space-y-2 text-sm">
                        <li className="border border-blue-500 p-2 rounded bg-[rgba(255,255,255,0.1)] text-white">
                            말1 - 능력치
                        </li>
                        <li className="border border-blue-500 p-2 rounded bg-[rgba(255,255,255,0.1)] text-white">
                            말2 - 능력치
                        </li>
                        <li className="border border-blue-500 p-2 rounded bg-[rgba(255,255,255,0.1)] text-white">
                            말3 - 능력치
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default GamePage;
