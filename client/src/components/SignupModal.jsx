// src/components/auth/SignupAvatarModal.jsx
import React, { useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { toast } from "@/context/ToastContext";
import { useAvatar } from "@/context/AvatarContext";
import Modal from "@/components/ui/Modal";

export default function SignupAvatarModal({ onClose }) {
  const { avatarsByGender, loadAvatars, partDepth, expList, expCounts } = useAvatar();

  // 폼 상태
  const [userId, setUserId] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("F");

  // 모달 내 아바타 선택 상태
  const [avatarIdx, setAvatarIdx] = useState(0);
  const [expression, setExpression] = useState("default");
  const [expNumber, setExpNumber] = useState(1);

  const { signup } = useAuth();

  // 현재 리스트
  const avatarList = avatarsByGender[gender] || [];
  const selAvatar = avatarList[avatarIdx] || {};
  const code = selAvatar.code || "";

  // 1) 성별 바뀔 때마다 메타 로드 & 인덱스·표정 리셋
  useEffect(() => {
    loadAvatars(gender);
    setAvatarIdx(0);
    setExpression("default");
  }, [gender, loadAvatars]);

  // 2) 인덱스 유효성 검사
  useEffect(() => {
    if (avatarIdx >= avatarList.length) {
      setAvatarIdx(0);
    }
  }, [avatarIdx, avatarList.length]);

  // 3) defaultItems가 undefined라면 빈 배열로
  const defaultItems = selAvatar.defaultItems ?? [];
  const layeredItems = defaultItems
    .slice()
    .sort((a, b) =>
      (partDepth[a.part_code] || 0) - (partDepth[b.part_code] || 0)
    );

  // 4) 현재 선택된 표정 GIF 경로
  const avatarImagePath =
    code === ""
      ? ""
      : expression === "default"
        ? `/resources/avatar/items/expressions/${code}_default_${gender}.gif`
        : `/resources/avatar/items/expressions/${code}_${expression}${expNumber}_${gender}.gif`;

  // 성별 버튼
  function handleGenderSelect(g) {
    setGender(g);
  }
  // 표정 버튼
  function handleExpressionSelect(expKey) {
    setExpression(expKey);
    if (expKey !== "default") {
      setExpNumber(Math.floor(Math.random() * (expCounts[expKey] || 1)) + 1);
    }
  }

  async function handleSignup() {
    if (!userId || !nickname || !password) {
      return toast("모든 항목을 입력해주세요.");
    }
    if (!code) {
      return toast("아바타를 선택해주세요.");
    }
    const { success, error } = await signup({
      userId,
      password,
      nickname,
      avatarCode: code,
      gender,
    });
    if (!success) {
      return toast(
        error === "DUPLICATE_ID" ? "이미 사용 중인 아이디입니다." :
          error === "DUPLICATE_NICKNAME" ? "이미 사용 중인 닉네임입니다." :
            "회원가입 실패: " + error
      );
    }
    toast("가입 완료! 로그인 해주세요.");
    onClose();
  }

  return (
    <Modal title="회원가입" onClose={onClose}>
      {/* — ID / 닉네임 / PW */}
      <div className="space-y-2 mb-4">
        <input
          value={userId}
          onChange={e => setUserId(e.target.value)}
          placeholder="아이디"
          className="w-full px-3 py-2 border rounded"
        />
        <input
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          placeholder="닉네임"
          className="w-full px-3 py-2 border rounded"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="비밀번호"
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      {/* — 성별 선택 */}
      <div className="flex justify-center gap-4 mb-4">
        {["F", "M"].map(g => (
          <button
            key={g}
            onClick={() => handleGenderSelect(g)}
            disabled={gender === g}
            className={`px-4 py-1 rounded-full font-bold ${gender === g ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
          >
            {g === "F" ? "여성" : "남성"}
          </button>
        ))}
      </div>

      {/* — 아바타 선택 */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <button
          onClick={() => setAvatarIdx(i => Math.max(0, i - 1))}
          disabled={avatarIdx === 0}
          className="px-2 py-1 bg-gray-200 rounded"
        >
          {"<"}
        </button>
        <div className="w-32 h-44 relative overflow-hidden">
          {layeredItems.map(item => (
            <img
              key={item.id}
              src={`/resources/avatar/${item.image_path}`}
              alt={item.part_code}
              className="absolute inset-0 w-full h-full object-contain"
              style={{ zIndex: partDepth[item.part_code] || 0 }}
              draggable={false}
            />
          ))}
          {code && (
            <img
              src={avatarImagePath}
              alt="표정"
              className="absolute inset-0 w-full h-full object-contain"
              style={{ zIndex: 100 }}
              draggable={false}
            />
          )}
        </div>
        <button
          onClick={() =>
            setAvatarIdx(i => Math.min(avatarList.length - 1, i + 1))
          }
          disabled={avatarIdx >= avatarList.length - 1}
          className="px-2 py-1 bg-gray-200 rounded"
        >
          {">"}
        </button>
      </div>

      {/* — 표정 선택 */}
      <div className="flex justify-center gap-1 mb-4">
        {expList.map(exp => (
          <button
            key={exp.key}
            onClick={() => handleExpressionSelect(exp.key)}
            className={`px-2 py-1 rounded-full text-sm ${expression === exp.key
              ? "bg-blue-400 text-white"
              : "bg-gray-200"
              }`}
          >
            {exp.label}
          </button>
        ))}
      </div>

      {/* — 가입하기 */}
      <button
        onClick={handleSignup}
        className="w-full py-2 bg-blue-500 text-white rounded-lg font-bold"
      >
        가입하기
      </button>
    </Modal>
  );
}
