// src/components/ui/AvatarPreview.jsx
import React from "react";
import { useAvatar } from "@/context/AvatarContext";

export default function AvatarPreview({ state }) {
    const {
        avatarsByGender,
        partDepth,
        getBodyLayer,
        getExpressionLayer,
        gender,  // context.gender
    } = useAvatar();
    /*
        const { equippedItems = {}, expression, expNumber } = state;
        const metaList = avatarsByGender[contextGender] || [];
        const baseAvatar = metaList.find(a => a.default) || metaList[0];
    */

    const {
        code: avatarCode,          // ← AvatarProvider 에서 넣어준 code
        equippedItems = {},
        expression,
        expNumber
    } = state;
    const metaList = avatarsByGender[gender] || [];
    // “내가 쓰는” 베이스 아바타를 먼저 찾고, fallback 으로 default
    const baseAvatar =
        metaList.find(a => a.code === avatarCode)
        || metaList.find(a => a.default)
        || metaList[0];
    if (!baseAvatar) {
        return (
            <div className="text-center text-gray-500">
                아바타 정보를 불러올 수 없습니다.
            </div>
        );
    }

    const { width = 128, height = 128, code, defaultItems = [] } = baseAvatar;

    return (
        <div className="relative" style={{ width, height }}>
            {Object.entries(partDepth)
                .sort(([, d1], [, d2]) => d1 - d2)
                .map(([partCode], idx) => {
                    if (partCode === "EXP") return null;

                    // ① 미리보기로 장착된 아이템 우선
                    const equippedId = equippedItems[partCode];
                    // ② 없으면 기본(defaultItems)으로
                    const def = defaultItems.find(d => d.part_code === partCode);
                    const itemId = equippedId || def?.id;
                    if (!itemId) return null;

                    // ③ context.gender(=contextGender) 기반으로 URL 획득
                    const url = getBodyLayer(partCode, itemId);
                    if (!url) return null;

                    return (
                        <img
                            key={partCode}
                            src={url}
                            alt={partCode}
                            className="absolute inset-0 w-full h-full object-contain"
                            style={{ zIndex: idx }}
                            draggable={false}
                        />
                    );
                })}

            {expression && (() => {
                const url = getExpressionLayer(code, expression, expNumber);
                if (!url) return null;
                return (
                    <img
                        key="EXP"
                        src={url}
                        alt={expression}
                        className="absolute inset-0 w-full h-full object-contain"
                        style={{ zIndex: Object.keys(partDepth).length + 1 }}
                        draggable={false}
                    />
                );
            })()}
        </div>
    );
}
