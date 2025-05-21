import React, { useState } from 'react';
import { signup } from '../api/api';

const SignupModal = ({ onClose }) => {
  const [userId, setUserId] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');

const handleSignup = async () => {
  const { success, error } = await signup({ userId, password, nickname });
  if (!success) {
    if (error === 'DUPLICATE') alert('ID 또는 닉네임 중복');
    else alert('가입 실패: ' + error);
    return;
  }
  alert('가입 완료! 로그인 해주세요.');
  onClose();
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



