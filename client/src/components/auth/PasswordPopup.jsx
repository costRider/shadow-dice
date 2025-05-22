import React, { useState } from "react";

const PasswordPopup = ({ onClose, onSubmit }) => {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    onSubmit(input);
    setInput("");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white w-[300px] p-6 rounded-lg shadow-xl">
        <h2 className="text-lg font-semibold mb-4 text-center">
          🔒 비밀번호 입력
        </h2>
        <input
          type="password"
          placeholder="비밀번호"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full border px-3 py-2 rounded mb-4"
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-sm"
          >
            취소
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordPopup;
