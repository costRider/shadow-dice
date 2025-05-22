🧊 Dice Shadow
🎲 최대 8인이 함께 플레이할 수 있는 멀티플레이 온라인 보드게임
🧑‍🤝‍🧑 친구들과 실시간으로 방을 만들고, 말(캐릭터)을 선택해 보드를 이동하며 전투/이벤트를 즐기는 게임

📌 프로젝트 개요
Dice Shadow는 주사위를 이용해 보드를 이동하고, 다양한 전략과 상호작용을 즐기는
멀티플레이 보드게임입니다.
게임은 온라인 대전 기반으로 2인~8인까지 함께 플레이할 수 있으며,
채팅, 캐릭터 선택, 전투 시스템 등이 포함되어 있습니다.

게임방 생성 및 입장

유저 로그인 / 회원가입

말(캐릭터) 선택 및 보유 관리

실시간 채팅

게임 진행 및 전투/이벤트 처리 (개발 중)

🛠️ 기술 스택
🧩 Frontend
React + Vite

Tailwind CSS v4

React Router v6

Context API (for global state)

🧰 Backend
Express

SQLite (경량 관계형 데이터베이스)

REST API 기반 서비스 분리 구조

🗂️ 디렉터리 구조 (요약)
bash
복사
편집
📁 client/
├── components/            # 공통 컴포넌트
├── screens/               # 화면 구성 (닉네임, 대기실, 게임 등)
├── services/              # API 통신 서비스 모듈
├── contexts/              # 전역 상태 관리 (UserContext 등)
├── App.jsx                # 라우터 설정
└── main.jsx               # 진입점

📁 server/
├── models/                # DB 접근 모델 (users, rooms, 등)
├── routes/                # API 라우터
├── services/              # 인증 / 유저 / 방 관리 로직
├── db/                    # SQLite 초기화 및 관리
└── index.js               # 서버 시작점
🚀 실행 방법
bash
복사
편집
# 1. 클라이언트 실행
cd client
npm install
npm run dev

# 2. 서버 실행
cd server
npm install
node index.js
📌 주요 기능
기능 구분	설명
🔐 회원가입 / 로그인	ID, 비밀번호 기반 인증 (로컬 또는 SQLite 기반 저장)
🏠 로비 / 대기실	방 생성, 입장, 유저 목록, 채팅
🎲 게임 진행 화면	상단(보드 + 캐릭터), 하단(채팅, 미니맵, 캐릭터 리스트) 분할 구조
📦 캐릭터 보유 시스템	사용자마다 여러 개의 말(캐릭터) 보유 및 선택 가능
🗨️ 실시간 채팅	대기실 및 게임 내 실시간 채팅 기능
🔧 확장 가능한 구조	서비스/모델 분리, Context 관리로 유지보수 용이

📍 향후 계획
 게임 내 턴 진행 및 주사위 굴림 시스템

 전투/이벤트 룰 구성

 캐릭터 특성 추가

 결과 화면 / 게임 종료 처리

 유저 경험 개선 및 애니메이션 추가

🧑‍💻 제작자
costRider

문의 및 피드백 환영!

