import React, { useState, useEffect } from "react";
import useAuth from "@/hooks/useAuth";
import { toast } from "@/context/ToastContext";
import { useAvatar } from "@/context/AvatarContext";
import Modal from "@/components/ui/Modal";

export default function SignupAvatarModal({ onClose }) {
  const { avatarsByGender, loadAvatars, partDepth, expList, expCounts } = useAvatar();
  const [userId, setUserId] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("F");
  const [avatarIdx, setAvatarIdx] = useState(0);
  const [expression, setExpression] = useState("default");
  const [expNumber, setExpNumber] = useState(1);

  const { signup } = useAuth();
  const avatarList = avatarsByGender[gender] || [];
  const selAvatar = avatarList[avatarIdx] || {};
  const name = selAvatar.code || "";

  // load once per gender
  useEffect(() => {
    loadAvatars(gender);
    setAvatarIdx(0);
    setExpression("default");
  }, [gender, loadAvatars]);

  // keep idx valid
  useEffect(() => {
    if (avatarIdx >= avatarList.length) setAvatarIdx(0);
  }, [avatarIdx, avatarList.length]);

  const layeredItems = (selAvatar.defaultItems || []).slice().sort(
    (a, b) => (partDepth[a.part_code] || 0) - (partDepth[b.part_code] || 0)
  );

  const avatarImagePath =
    expression === "default"
      ? `/resources/avatar/items/expressions/${name}_default_${gender}.gif`
      : `/resources/avatar/items/expressions/${name}_${expression}${expNumber}_${gender}.gif`;

  function handleGender(g) {
    if (g !== gender) setGender(g);
  }
  function handleExp(exp) {
    setExpression(exp);
    if (exp !== "default") {
      setExpNumber(Math.floor(Math.random() * (expCounts[exp] || 1)) + 1);
    }
  }
  async function handleSignup() {
    if (!userId || !nickname || !password) return toast("모든 항목을 입력해주세요.");
    if (!name) return toast("아바타를 선택해주세요.");
    const { success, error } = await signup({ userId, password, nickname, avatarCode: name, gender });
    if (!success) {
      toast(
        error === "DUPLICATE_ID" ? "이미 사용 중인 아이디입니다." :
          error === "DUPLICATE_NICKNAME" ? "이미 사용 중인 닉네임입니다." :
            "회원가입 실패: " + error
      );
      return;
    }
    toast("가입 완료! 로그인 해주세요.");
    onClose();
  }

  return (
    <Modal title="회원가입" onClose={onClose}>
      {/* 입력폼 */}
      <div className="space-y-2 mb-4">
        <input value={userId} onChange={e => setUserId(e.target.value)}
          className="w-full px-3 py-2 border rounded bg-white/80" placeholder="아이디" />
        <input value={nickname} onChange={e => setNickname(e.target.value)}
          className="w-full px-3 py-2 border rounded bg-white/80" placeholder="닉네임" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded bg-white/80" placeholder="비밀번호" />
      </div>

      {/* 성별 */}
      <div className="flex justify-center gap-4 mb-4">
        {["F", "M"].map(g => (
          <button key={g}
            disabled={gender === g}
            onClick={() => handleGender(g)}
            className={`px-4 py-1 rounded-full font-bold
               ${gender === g ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            {g === "F" ? "여성" : "남성"}
          </button>
        ))}
      </div>

      {/* 아바타 선택 */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <button onClick={() => setAvatarIdx(i => Math.max(0, i - 1))} disabled={avatarIdx === 0}
          className="px-2 py-1 bg-gray-200 rounded">{"<"}</button>
        <div className="w-32 h-44 relative overflow-hidden">
          {layeredItems.map(item => (
            <img key={item.id}
              src={`/resources/avatar/${item.image_path.replace(/\\/g, "/")}`}
              alt={item.part_code}
              className="absolute inset-0 w-full h-full object-contain"
              style={{ zIndex: partDepth[item.part_code] || 0 }}
              draggable={false}
            />
          ))}
          {name && (
            <img src={avatarImagePath} alt="표정"
              className="absolute inset-0 w-full h-full object-contain"
              style={{ zIndex: 100 }} draggable={false} />
          )}
        </div>
        <button onClick={() => setAvatarIdx(i => Math.min(avatarList.length - 1, i + 1))} disabled={avatarIdx >= avatarList.length - 1}
          className="px-2 py-1 bg-gray-200 rounded">{">"}</button>
      </div>

      {/* 표정 */}
      <div className="flex justify-center gap-1 mb-4">
        {expList.map(exp => (
          <button key={exp.key} onClick={() => handleExp(exp.key)}
            className={`px-2 py-1 rounded-full text-sm
               ${expression === exp.key ? "bg-blue-400 text-white" : "bg-gray-200"}`}>
            {exp.label}
          </button>
        ))}
      </div>

      {/* 확인 */}
      <button onClick={handleSignup}
        className="w-full py-2 bg-blue-500 text-white rounded-lg font-bold">
        가입하기
      </button>
    </Modal>
  );
}
