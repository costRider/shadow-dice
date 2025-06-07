import React, { useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { toast } from "@/context/ToastContext";
import { useAvatar } from "@/context/AvatarContext"; // ← 이걸로 한 번에!

const SignupAvatarModal = ({ onClose }) => {
  const { partDepth, expList, expCounts } = useAvatar();

  const [userId, setUserId] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("F");
  const [avatarList, setAvatarList] = useState([]);
  const [avatarIdx, setAvatarIdx] = useState(0);
  const [expression, setExpression] = useState("default");
  const [expNumber, setExpNumber] = useState(1);

  const selectedAvatar = avatarList[avatarIdx] || {};
  const avatarName = selectedAvatar.code || "";

  // 부위 레이어 zIndex 오름차순 정렬
  const layeredItems = (selectedAvatar.defaultItems || []).slice().sort(
    (a, b) => (partDepth[a.part_code] ?? 0) - (partDepth[b.part_code] ?? 0)
  );

  // 표정 파일 경로 생성
  const avatarImagePath =
    expression === "default"
      ? `/resources/avatar/items/expressions/${avatarName}_${expression}_${gender}.gif`
      : `/resources/avatar/items/expressions/${avatarName}_${expression}${expNumber}_${gender}.gif`;

  const { signup } = useAuth();

  // 아바타 목록 fetch (성별 변경 시)
  useEffect(() => {
    setAvatarList([]); // UX: 로딩 중 깔끔하게
    setAvatarIdx(0);
    setExpression("default");
    setExpNumber(1);
    fetch(`/api/avatars?gender=${gender}`)
      .then(res => res.json())
      .then(data => setAvatarList(data || []));
  }, [gender]);

  // avatarIdx 오버 방지
  useEffect(() => {
    if (avatarIdx > avatarList.length - 1) setAvatarIdx(0);
  }, [avatarList]);

  // 성별 전환 (같은 성별 누르면 무시)
  function handleGenderChange(newGender) {
    if (gender === newGender) return;
    setGender(newGender);
    setAvatarIdx(0);
    setExpression("default");
    setExpNumber(1);
    setAvatarList([]);
  }

  // 표정 변경 (랜덤 넘버)
  function handleExpChange(exp) {
    setExpression(exp);
    setExpNumber(
      exp === "default" ? 1 : Math.floor(Math.random() * (expCounts[exp] || 1)) + 1
    );
  }

  // 회원가입 요청
  async function handleSignup() {
    if (!userId || !nickname || !password) return toast("모든 항목을 입력해주세요.");
    if (!selectedAvatar.code || !gender) return toast("아바타와 성별을 선택하세요!");
    try {
      const { success, error } = await signup({
        userId, password, nickname, avatarCode: selectedAvatar.code, gender,
      });
      if (!success) {
        toast(
          error === "DUPLICATE_ID" ? "이미 사용 중인 아이디입니다."
            : error === "DUPLICATE_NICKNAME" ? "이미 사용 중인 닉네임입니다."
              : "회원가입 실패: " + error
        );
        return;
      }
      toast("가입 완료! 로그인 해주세요.");
      onClose();
    } catch (err) {
      toast("가입 중 오류 발생: " + err.message);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "#aeb4e9" }}>
      <div className="w-[410px] rounded-2xl shadow-2xl border border-blue-300 bg-white/90 backdrop-blur-md flex flex-col items-center py-6 px-8">
        <div className="text-[1.6rem] font-bold text-blue-700 mb-3 tracking-wide"
          style={{ textShadow: "0px 3px 8px #e5e6f8" }}>
          회원가입
        </div>
        {/* 입력폼 */}
        <div className="w-full mb-2">
          <input className="w-full mb-2 px-3 py-2 border border-blue-200 rounded text-blue-900 placeholder-blue-400 bg-white/80"
            placeholder="아이디" value={userId} onChange={e => setUserId(e.target.value)} />
          <input className="w-full mb-2 px-3 py-2 border border-blue-200 rounded text-blue-900 placeholder-blue-400 bg-white/80"
            placeholder="닉네임" value={nickname} onChange={e => setNickname(e.target.value)} />
          <input className="w-full px-3 py-2 border border-blue-200 rounded text-blue-900 placeholder-blue-400 bg-white/80"
            type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        {/* 성별 선택 */}
        <div className="flex justify-center gap-3 mb-2">
          <button className={`px-4 py-1 rounded-full transition font-bold ${gender === "F" ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-800"}`}
            disabled={gender === "F"} onClick={() => handleGenderChange("F")}>여성</button>
          <button className={`px-4 py-1 rounded-full transition font-bold ${gender === "M" ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-800"}`}
            disabled={gender === "M"} onClick={() => handleGenderChange("M")}>남성</button>
        </div>
        {/* 아바타 프리뷰 */}
        <div className="flex items-center justify-center gap-2 my-3">
          <button className="bg-blue-100 text-blue-700 font-bold rounded-full w-8 h-8 flex items-center justify-center shadow"
            disabled={avatarIdx <= 0}
            onClick={() => setAvatarIdx(idx => Math.max(0, idx - 1))}>{"<"}</button>
          <div className="w-32 h-44 relative flex items-center justify-center bg-blue-50 border border-blue-200 rounded-xl shadow-inner overflow-hidden">
            {/* 아바타 base/body + 장비 레이어 */}
            {layeredItems.map(item => {
              if (!item?.image_path) return null;
              const src = `/resources/avatar/${item.image_path.replace(/\\/g, "/")}`;
              return (
                <img
                  key={item.id || `${item.part_code}-${item.image_path}`}
                  src={src}
                  alt={item.part_code}
                  style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    zIndex: partDepth[item.part_code] ?? 1,
                    pointerEvents: "none"
                  }}
                  draggable={false}
                />
              );
            })}
            {/* 표정 (맨 위) */}
            {avatarName &&
              <img
                src={avatarImagePath}
                alt="아바타 표정"
                style={{
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  zIndex: 100,
                  pointerEvents: "none"
                }}
                draggable={false}
              />}
          </div>
          <button className="bg-blue-100 text-blue-700 font-bold rounded-full w-8 h-8 flex items-center justify-center shadow"
            disabled={avatarIdx >= avatarList.length - 1}
            onClick={() => setAvatarIdx(idx => Math.min(avatarList.length - 1, idx + 1))}>{">"}</button>
        </div>
        {/* 표정 버튼 */}
        <div className="flex justify-center gap-1 mb-2">
          {expList.map(exp => (
            <button key={exp.key}
              className={`px-2 py-1 rounded-full text-sm transition
                ${expression === exp.key ? "bg-blue-400 text-white" : "bg-blue-100 text-blue-800"}`}
              onClick={() => handleExpChange(exp.key)}>
              {exp.label}
            </button>
          ))}
        </div>
        {/* 아바타 이름/설명 */}
        <div className="text-center text-blue-900 font-bold mt-2">
          {selectedAvatar?.name}
          <span className="block text-xs text-blue-500">{selectedAvatar?.description}</span>
        </div>
        {/* OK / Cancel 버튼 */}
        <div className="flex justify-center gap-4 mt-6">
          <button onClick={handleSignup} className="w-28 h-10 text-lg font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow">OK</button>
          <button onClick={onClose} className="w-28 h-10 text-lg font-bold bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default SignupAvatarModal;
