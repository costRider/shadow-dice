
// src/components/lobby/UserProfileModal.jsx
import React, { useEffect, useState } from "react";
import { useAvatar } from "@/context/AvatarContext";
import { toast } from "@/context/ToastContext";

export default function UserProfileModal({ userId, onClose }) {
    const {
        partDepth,
        avatarsByGender,
        loadAvatars,
        getExpressionLayer,
        toAvatarUrl,
    } = useAvatar();

    const [profile, setProfile] = useState(null);

    useEffect(() => {
        if (!userId) return;
        fetch(`/api/users/${userId}`)
            .then(res => res.ok ? res.json() : Promise.reject())
            .then(data => {
                setProfile(data);
                loadAvatars(data.avatar_gender);
            })
            .catch(() => {
                toast("프로필을 불러올 수 없습니다.");
                setProfile(null);
            });
    }, [userId, loadAvatars, toast]);

    if (!profile) return null;

    const {
        nickname, gp, createdAt,
        avatar_code: code,
        avatar_gender: gender,
        expression: expKey,
        exp_number: expNum,
        equippedItems,
    } = profile;

    const metaList = avatarsByGender[gender] || [];
    const baseMeta = metaList.find(a => a.code === code) || {};

    const layers = [];

    // BODY
    if (baseMeta.image_path) {
        layers.push({
            part_code: "BODY",
            url: toAvatarUrl(baseMeta.image_path),
            depth: partDepth["BODY"] || 0,
        });
    }

    // 기타 파트
    Object.entries(partDepth)
        .sort(([, d1], [, d2]) => d1 - d2)
        .forEach(([partCode]) => {
            if (partCode === "BODY" || partCode === "EXP") return;

            // 1) 장착 아이템이 있으면
            const eq = equippedItems.find(e => e.part_code === partCode);
            if (eq) {
                layers.push({
                    part_code: partCode,
                    url: toAvatarUrl(eq.image_path),
                    depth: partDepth[partCode],
                });
                return;
            }

            // 2) 없으면 기본(defaultItems)에서
            const defItem = (baseMeta.defaultItems || [])
                .find(d => d.part_code === partCode);
            if (defItem) {
                layers.push({
                    part_code: partCode,
                    url: toAvatarUrl(defItem.image_path),    // ← 직접 image_path 사용
                    depth: partDepth[partCode],
                });
            }
        });

    // EXP
    const expUrl = getExpressionLayer(code, expKey, expNum, gender);
    if (expUrl) {
        layers.push({
            part_code: "EXP",
            url: expUrl,
            depth: Math.max(...Object.values(partDepth), 0) + 1,
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl p-6 shadow-lg w-80">
                <button onClick={onClose} className="float-right text-gray-500 hover:text-gray-900">✕</button>
                <h2 className="text-xl font-bold mb-4">{nickname} 님 프로필</h2>

                <div className="flex justify-center mb-4">
                    <div className="relative w-32 h-40">
                        {layers.map(layer => (
                            <img
                                key={layer.part_code}
                                src={layer.url}
                                alt={layer.part_code}
                                className="absolute inset-0 object-contain w-full h-full"
                                style={{ zIndex: layer.depth }}
                                draggable={false}
                            />
                        ))}
                    </div>
                </div>

                <ul className="text-gray-700 space-y-1">
                    <li><strong>닉네임:</strong> {nickname}</li>
                    <li><strong>GP:</strong> {gp}</li>
                    <li><strong>가입일:</strong> {new Date(createdAt).toLocaleDateString()}</li>
                </ul>

                <button onClick={onClose} className="mt-6 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">닫기</button>
            </div>
        </div>
    );
}
