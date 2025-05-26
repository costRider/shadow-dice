import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SignupModal from "@/components/SignupModal";
import useAuth from "@/hooks/useAuth";
import { useToast } from '@/context/ToastContext';

const LoginPage = () => {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [showSignup, setShowSignup] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    const { login } = useAuth();

    const handleLogin = async () => {
        if (!userId || !password) {
            toast("ID와 비밀번호를 입력해주세요.");
            return;
        }

        const res = await login(userId, password);
        if (res.success) {
            navigate("/lobby");
        } else {
            toast("로그인 실패: " + res.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-gray-900 text-white">
            <h1 className="text-4xl font-bold mb-8">🎲 Dice Shadow</h1>

            <input
                className="w-64 px-4 py-2 mb-2 border rounded text-white"
                placeholder="아이디"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
            />
            <input
                className="w-64 px-4 py-2 mb-4 border rounded text-white"
                placeholder="비밀번호"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <div className="flex space-x-4">
                <button
                    onClick={handleLogin}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    로그인
                </button>
                <button
                    onClick={() => setShowSignup(true)}
                    className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400 text-black"
                >
                    회원가입
                </button>
            </div>

            {showSignup && <SignupModal onClose={() => setShowSignup(false)} />}
        </div>
    );
};

export default LoginPage;
