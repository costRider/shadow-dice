import React, { useEffect, useState } from "react";
import { useAvatar } from "@/context/AvatarContext";
import { toast } from "@/context/ToastContext";

export default function UserProfileModal({ userId, onClose }) {
    const { partDepth, avatarsByGender, loadAvatars, getExpressionLayer } = useAvatar();
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        if (!userId) return;
        fetch(`/api/users/${userId}`)
            .then(res => res.ok ? res.json() : Promise.reject(res.status))
            .then(data => {
                setProfile(data);
                loadAvatars(data.avatar_gender);
            })
            .catch(() => {
                toast("프로필을 불러오지 못했습니다.");
                setProfile(null);
            });
    }, [userId, loadAvatars]);

    if (!profile) return null;

    const {
        nickname,
        gp,
        createdAt,
        avatar_code: code,
        avatar_gender: gender,
        expression: expKey,
        exp_number: expNum,
        equippedItems
    } = profile;

    // 1) get body layer from context meta
    const meta = (avatarsByGender[gender] || []).find(a => a.code === code) || {};
    const bodyLayer = meta.image_path && {
        part_code: 'BODY', id: `body_${code}`, image_path: meta.image_path
    };

    // 2) build expression layer via context helper
    const exprLayer = getExpressionLayer(code, expKey, expNum, gender);

    // 3) combine and dedupe by part_code
    const all = [bodyLayer, ...(meta.defaultItems || []), ...equippedItems, exprLayer]
        .filter(Boolean)
        .reduce((map, layer) => {
            if (!map.has(layer.part_code)) map.set(layer.part_code, layer);
            return map;
        }, new Map())
        .values();

    // 4) sort by depth
    const layers = Array.from(all).sort((a, b) =>
        (partDepth[a.part_code] || 0) - (partDepth[b.part_code] || 0)
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl p-6 shadow-lg w-80">
                <button onClick={onClose} className="float-right text-gray-500 hover:text-gray-900">✕</button>
                <h2 className="text-xl font-bold mb-4">{nickname} 님 프로필</h2>
                <div className="flex justify-center mb-4">
                    <div className="relative w-32 h-40">
                        {layers.map(item => (
                            <img
                                key={item.part_code}
                                src={`/resources/avatar/${item.image_path.replace(/\\/g, "/")}`}
                                alt={item.part_code}
                                className="absolute inset-0 object-contain w-full h-full"
                                style={{ zIndex: partDepth[item.part_code] || 0 }}
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
                <button
                    onClick={onClose}
                    className="mt-6 w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                >닫기</button>
            </div>
        </div>
    );
}
