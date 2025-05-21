import React, { useState } from "react";
import { login } from "../api";
import { UserContext } from "../context/UserContext";

const WelcomePopup = ({ onSubmit }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white w-[300px] p-6 rounded-lg shadow-xl">
        <h2 className="text-lg font-semibold mb-4 text-center">
          {" "}
          😎 로그인 보상
        </h2>
        <p className="text-center font-blod">안녕하세요, {user.nickname}님!</p>
        <p className="text-center mb-4">
          로그인 보상으로 💸 100 GP를 지급합니다!
        </p>
        <div className="flex justify-end space-x-2">
          <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm">
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default PasswordPopup;
