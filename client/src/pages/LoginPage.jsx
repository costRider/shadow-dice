import React, { useState, useEffect } from "react";
import SignupModal from "@/components/SignupModal";
import useAuth from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import SpriteAnimator from '@/components/SpriteAnimator';

const LoginPage = () => {
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [showSignup, setShowSignup] = useState(false);
    const toast = useToast();

    const { login } = useAuth();

    useEffect(() => {
        // CHR001 리소스 로드
        fetch('/api/character-resources?code=CHR001')
            .then(async res => {
                if (!res.ok) throw new Error(await res.text());
                return res.json();
            })
            .then(data => {
                console.log('▶ character-resources:', data);
                setResources(data);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
            });
    }, []);

    const handleLogin = async () => {
        if (!userId || !password) {
            toast("ID와 비밀번호를 입력해주세요.");
            return;
        }

        const res = await login(userId, password);
        if (!res.success) {
            toast("로그인 실패: " + res.message);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-[url('/images/login-bg.jpg')] bg-cover bg-center">
            {/* 네이비톤 반투명 오버레이 */}
            <div className="absolute inset-0 bg-[rgba(0,0,64,0.7)]"></div>

            <div className="relative z-10 flex flex-col items-center p-8 rounded-2xl bg-[rgba(10,10,50,0.85)] shadow-2xl w-100">
                <h1 className="text-4xl font-bold text-amber-300 mb-8">🎲 Dice Shadow</h1>
                <SpriteAnimator
                    jsonUrl="/resources/characters/CHR001/CHR001_sprite.json"
                    imageUrl="/resources/characters/CHR001/CHR001_sprite.png"
                    fps={6}
                    loop={true}
                    sliceBaseName="top_walk"
                />
                <input
                    className="w-full px-4 py-2 mb-2 bg-[rgba(255,255,255,0.1)] border border-blue-400 rounded text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="아이디"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                />
                <input
                    className="w-full px-4 py-2 mb-4 bg-[rgba(255,255,255,0.1)] border border-blue-400 rounded text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="비밀번호"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <div className="flex w-full space-x-4">
                    <button
                        onClick={handleLogin}
                        className="flex-1 bg-gradient-to-b from-blue-500 to-blue-700 text-white px-4 py-2 rounded hover:scale-105 transition transform shadow-lg"
                    >
                        로그인
                    </button>
                    <button
                        onClick={() => setShowSignup(true)}
                        className="flex-1 bg-gradient-to-b from-gray-300 to-gray-400 text-black px-4 py-2 rounded hover:scale-105 transition transform shadow-lg"
                    >
                        회원가입
                    </button>
                </div>

                {showSignup && <SignupModal onClose={() => setShowSignup(false)} />}
            </div>
        </div>
    );
};

export default LoginPage;
