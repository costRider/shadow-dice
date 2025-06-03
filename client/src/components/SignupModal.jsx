import React, { useState } from "react";
import useAuth from "@/hooks/useAuth";
import { toast } from "@/context/ToastContext";

const SignupModal = ({ onClose }) => {
  const [userId, setUserId] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");

  const { signup } = useAuth();

  const handleSignup = async () => {
    if (!userId || !nickname || !password) {
      toast("모든 항목을 입력해주세요.");
      return;
    }

    try {
      const { success, error } = await signup({ userId, password, nickname });
      if (!success) {
        if (error === "DUPLICATE_ID") {
          toast("이미 사용 중인 아이디입니다.");
        } else if (error === "DUPLICATE_NICKNAME") {
          toast("이미 사용 중인 닉네임입니다.");
        } else {
          toast("회원가입 실패: " + error);
        }
        return;
      }
      toast("가입 완료! 로그인 해주세요.");
      onClose();
    } catch (err) {
      toast("가입 중 오류 발생: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* 반투명 블랙 오버레이 */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <div className="relative z-10 w-96 bg-[rgba(10,10,40,0.85)] border border-blue-500 shadow-lg p-6 rounded-xl">
        <h2 className="text-2xl font-bold text-yellow-300 mb-6">회원가입</h2>

        <input
          className="w-full mb-4 px-3 py-2 bg-[rgba(255,255,255,0.1)] border border-blue-400 rounded text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="아이디"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <input
          className="w-full mb-4 px-3 py-2 bg-[rgba(255,255,255,0.1)] border border-blue-400 rounded text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <input
          className="w-full mb-4 px-3 py-2 bg-[rgba(255,255,255,0.1)] border border-blue-400 rounded text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
            onClick={onClose}
          >
            취소
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={handleSignup}
          >
            가입
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;
