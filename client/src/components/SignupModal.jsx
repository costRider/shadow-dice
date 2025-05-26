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
        console.error("에러 사유:", error);
        if (error === 'DUPLICATE_ID') {
          toast('이미 사용 중인 아이디입니다.');
        } else if (error === 'DUPLICATE_NICKNAME') {
          toast('이미 사용 중인 닉네임입니다.');
        } else {
          toast('회원가입 실패: ' + error);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 space-y-4">
        <h2 className="text-xl font-bold text-gray-800">회원가입</h2>
        <input
          className="w-full px-3 py-2 border rounded text-black"
          placeholder="아이디"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <input
          className="w-full px-3 py-2 border rounded text-black"
          placeholder="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <input
          className="w-full px-3 py-2 border rounded text-black"
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex justify-end space-x-2">
          <button
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            취소
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { signup } from "@/services/api";
//