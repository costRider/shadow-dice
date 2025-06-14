import React, { useEffect, useRef } from "react";
import { useAvatar } from "@/context/AvatarContext";
import { useToast } from "@/context/ToastContext";
import { useAvatarEquips } from "@/hooks/useAvatarEquip";
import AvatarPreview from "@/components/ui/AvatarPreview";

export default function AvatarRoomModal({ onClose }) {
    const toast = useToast();
    const initialApplied = useRef(false);

    const {
        inventory,
        equips,
        fetchInventory,
        fetchEquips,
        equip,
        unequip
    } = useAvatarEquips();

    const {
        gender,
        avatarState,
        previewEquip,
        resetEquip
    } = useAvatar();

    // 최초 데이터 fetch
    useEffect(() => {
        fetchInventory();
        fetchEquips();
    }, []);

    // 장착 정보 초기 적용 (최초 1회)
    useEffect(() => {
        if (initialApplied.current || !Object.keys(equips || {}).length || !inventory.length) return;

        Object.entries(equips).forEach(([partCode, itemId]) => {
            const item = inventory.find(i => String(i.item_id) === String(itemId));
            if (item) {
                previewEquip({
                    partCode,
                    itemId,
                    thumbnailUrl: `/resources/avatar/${item.image_path}`
                });
            }
        });

        initialApplied.current = true;
    }, [equips, inventory]);

    const handleClose = () => {
        initialApplied.current = false;
        resetEquip();
        onClose();
    };

    const handleEquip = (item) => {
        equip(item.part_code, item.item_id);
        previewEquip({
            partCode: item.part_code,
            itemId: item.item_id,
            thumbnailUrl: `/resources/avatar/${item.image_path}`
        });
        toast("✅ 아이템이 장착되었습니다");
    };

    const handleUnequip = (item) => {
        unequip(item.part_code);
        resetEquip(item.part_code);
        toast("❎ 아이템이 탈착되었습니다");
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg w-[900px] h-[600px] shadow-lg relative flex flex-col">
                <button onClick={handleClose} className="absolute top-2 right-2 text-gray-500 hover:text-black">
                    ✖
                </button>
                <h2 className="text-xl font-bold mb-4 text-center">🎨 아바타룸
                </h2>

                <div className="flex flex-1 overflow-hidden gap-4">
                    {/* 아이템 목록 */}
                    <div className="w-2/3 overflow-y-auto grid grid-cols-2 gap-4 pr-1">
                        {inventory
                            .filter(item => !item.gender || item.gender === gender)
                            .map(item => {
                                const isEquipped = String(avatarState.equippedItems[item.part_code]?.id) === String(item.item_id);

                                return (
                                    <div
                                        key={item.item_id}
                                        className={`border rounded p-2 text-sm ${isEquipped ? "bg-green-100" : "bg-white"}`}
                                    >
                                        <img
                                            src={`/resources/avatar/${item.image_path}`}
                                            alt={item.name}
                                            className="w-24 h-24 object-contain mx-auto mb-1"
                                        />
                                        <div className="font-semibold text-center">{item.name}</div>
                                        <div className="text-xs text-gray-500 text-center">{item.description}</div>
                                        <div className="text-center mt-2">
                                            {isEquipped ? (
                                                <button
                                                    className="text-xs px-2 py-1 bg-red-500 text-white rounded"
                                                    onClick={() => handleUnequip(item)}
                                                >
                                                    탈차
                                                </button>
                                            ) : (
                                                <button
                                                    className="text-xs px-2 py-1 bg-blue-500 text-white rounded"
                                                    onClick={() => handleEquip(item)}
                                                >
                                                    장착
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>

                    {/* 아바타 미리보기 */}
                    <div className="w-1/3 flex justify-center items-start bg-gray-50 rounded p-2">
                        <AvatarPreview state={avatarState} />
                    </div>
                </div>
            </div>
        </div>
    );
}
