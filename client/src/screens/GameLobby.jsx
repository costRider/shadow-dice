import { useLocation, useNavigate } from 'react-router-dom';

const GameLobby = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const room = location.state?.room;

  
  const toggleReady = async () => {
    const next = !isReady;
    await readyRoomAPI(room.id, user.userId, next);
    setIsReady(next);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-gray-100">
      {/* 상단 75% */}
      <div className="flex" style={{ height: '75%' }}>
        {/* 좌측 45% */}
        <div className="w-[45%] flex flex-col border-r bg-white">
          {/* 상단: 유저 목록 */}
          <div className="h-[70%] p-4 border-b">
            <h2 className="font-semibold mb-3">👥 유저 슬롯</h2>
            <ul className="grid grid-cols-2 gap-2">
              {[...Array(8)].map((_, i) => (
                <li key={i} className="border rounded p-2 text-sm text-center bg-gray-50">
                  {i + 1}P - 대기중
                </li>
              ))}
            </ul>
          </div>
          {/* 하단: 방 정보 */}
          <div className="h-[30%] p-4 text-sm">
            <h3 className="font-semibold mb-2">📋 방 정보</h3>
            <p>방 이름: {room?.roomName}</p>
            <p>맵: {room?.selectedMap}</p>
            <p>인원: {room?.maxPlayers}명</p>
            <p>형태: {room?.isPrivate ? '🔒 비공개' : '🌐 공개'}</p>
          </div>
        </div>

        {/* 우측 55% */}
        <div className="w-[55%] flex flex-col">
          {/* 상단: 말 선택 */}
          <div className="h-[90%] p-4 border-b overflow-auto">
            <h2 className="font-semibold mb-2">🎯 선택 가능한 게임 말</h2>
            <div className="grid grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="border p-3 rounded bg-white text-sm shadow">
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
                        navigate('/game');
                    }}
                className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
                준비 / 시작
              </button>
            </div>
            <div className="w-[10%] text-right">
              <button
                onClick={() => navigate('/lobby')}
                className="text-red-500 hover:underline text-sm"
              >
                ❌ 나가기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 25% */}
      <div className="flex h-[25%] border-t bg-white">
        {/* 좌: 채팅 */}
        <div className="w-[80%] p-4 flex flex-col">
          <div className="flex-1 overflow-y-auto text-sm space-y-1">
            <div className="bg-blue-100 rounded px-3 py-1 self-end">나: 안녕하세요</div>
            <div className="bg-gray-200 rounded px-3 py-1 self-start">유저1: 반갑습니다</div>
          </div>
          <div className="mt-2 flex gap-2">
            <input type="text" className="flex-1 border px-3 py-2 rounded" placeholder="채팅 입력..." />
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">전송</button>
          </div>
        </div>
        {/* 우: 접속자 목록 */}
        <div className="w-[20%] p-4 border-l text-sm">
          <h4 className="font-semibold mb-2">현재 접속자</h4>
          <ul className="space-y-1">
            <li>🟢 {room?.hostName || '방장'}</li>
            <li>🟢 게스트1</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GameLobby;
