import React, { useState, useMemo, useEffect, useRef } from "react";
import { useShopItems, usePurchase } from "@/hooks/useShop";
import { useAvatar } from "@/context/AvatarContext";
import useAuth from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import AvatarPreview from "@/components/ui/AvatarPreview";
import { useAvatarEquips } from "@/hooks/useAvatarEquip";

export default function AvatarCostumeShopTab() {
    const toast = useToast();
    const { user } = useAuth();
    const gp = user?.gp ?? 0;

    const { items, loading, error, refetch } = useShopItems("avatar_costume");
    const { purchase } = usePurchase();
    const {
        gender,
        previewOnlyState,
        previewEquip,
        resetEquip, // partCode도 받을 수 있도록 구현되어 있어야 함
    } = useAvatar();

    const [buyingAll, setBuyingAll] = useState(false);
    const initialCopied = useRef(false);

    const {
        inventory,
        equips,
        fetchInventory,
        fetchEquips,
    } = useAvatarEquips();

    // 최초 데이터 fetch
    useEffect(() => {
        fetchInventory();
        fetchEquips();
    }, []);

    // 성별 필터
    const genderedItems = useMemo(
        () => items.filter(it => it.metadata.gender === gender),
        [items, gender]
    );
    // 현재 선택된 아이템 목록
    const selectedItems = useMemo(() => {
        return Object.entries(previewOnlyState.equippedItems)
            .map(([part, info]) => {
                const match = genderedItems.find(it =>
                    String(it.id) === String(info?.id) && it.metadata.part === part
                );
                console.log("🔍 매칭 검사:", { part, id: info?.id, match });
                return match;
            })
            .filter(Boolean);
    }, [previewOnlyState.equippedItems, genderedItems]);
    //console.log("아이템샵 장착 아이템 목록:", previewOnlyState);

    const totalPrice = useMemo(
        () => selectedItems
            .filter(it => !it.owned) // 🟡 보유하지 않은 아이템만 가격 계산
            .reduce((sum, it) => sum + it.price, 0),
        [selectedItems]
    );

    const handleBuy = async (id) => {
        const ok = await purchase(id);
        if (ok) {
            toast("🎉 구매되었습니다!");
            await refetch();
        } else {
            toast("❌ 구매 실패");
        }
    };

    const restoreEquips = () => {
        resetEquip(); // 미리보기 상태 초기화
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
    };

    useEffect(() => {
        if (initialCopied.current || !Object.keys(equips || {}).length || !inventory.length) return;

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

        initialCopied.current = true;
    }, [equips, inventory]);

    const handleBuyAll = async () => {
        if (totalPrice === 0) return;
        if (totalPrice > gp) {
            toast("⚠️ GP가 부족합니다.");
            return;
        }

        setBuyingAll(true);
        // ❗ selectedItems를 기준으로 구매 (owned 아닌 것만)
        for (const item of selectedItems) {
            if (!item.owned) {
                const ok = await purchase(item.id);
                if (!ok) toast(`❌ '${item.metadata.name}' 구매 실패`);
            }
        }

        await refetch();
        setBuyingAll(false);
        toast("🎉 선택 코스튬을 모두 구매했습니다!");
    };


    if (loading) return <div>로딩 중…</div>;
    if (error) return <div>상품 불러오기 실패: {error.message}</div>;

    return (
        <div className="flex">
            {/* 좌측: 아이템 목록 */}
            <div className="w-2/3 max-h-[500px] overflow-y-auto pr-2">
                <div className="grid grid-cols-3 gap-4">
                    {genderedItems.map(item => {
                        const { id, price, owned, metadata: m, thumbnailUrl } = item;
                        const part = m.part;
                        const isEquipped = previewOnlyState.equippedItems[part]?.id === id;

                        return (
                            <div key={id} className="border p-2 rounded flex flex-col items-center">
                                <img src={item.thumbnailUrl} alt={m.name} className="w-24 h-24 object-contain mb-2" />
                                <div className="font-semibold text-center text-sm">{m.name}</div>
                                <div className="text-xs text-gray-500">GP {price}</div>

                                {owned ? (
                                    <button
                                        className="mt-1 px-2 py-1 bg-gray-400 text-white rounded text-xs"
                                        onClick={() =>
                                            isEquipped
                                                ? resetEquip(part)
                                                : previewEquip({ partCode: part, itemId: id, thumbnailUrl })
                                        }
                                    >
                                        {isEquipped ? "미리보기 해제" : "보유중"}
                                    </button>
                                ) : (
                                    <div className="mt-1 flex space-x-1">
                                        <button
                                            className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                                            onClick={() =>
                                                isEquipped
                                                    ? resetEquip(part)
                                                    : previewEquip({ partCode: part, itemId: id, thumbnailUrl })
                                            }
                                        >
                                            {isEquipped ? "미리보기 해제" : "착용 미리보기"}
                                        </button>
                                        <button
                                            className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                                            disabled={buyingAll}
                                            onClick={() => handleBuy(id)}
                                        >
                                            구매
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 우측: 아바타 미리보기 및 구매 UI */}
            <div className="w-1/3 pl-4">
                <h3 className="text-lg font-bold mb-2">현재 착용 상태</h3>

                <button
                    className="px-2 py-1 text-xs bg-red-200 rounded hover:bg-red-300 mb-2"
                    onClick={() => restoreEquips()}
                >
                    장착 초기화
                </button>

                <div className="border p-4 rounded mb-4">
                    <AvatarPreview state={previewOnlyState} />
                </div>

                <div className="mb-2">
                    <h4 className="text-sm font-bold mb-1">선택된 코스튬</h4>
                    <ul className="text-xs text-gray-700 list-disc ml-4">
                        {selectedItems.map(it => (
                            <li key={it.id} className="mb-1">
                                <div className="font-medium flex items-center gap-1">
                                    {it.metadata.description}
                                    {it.owned && (
                                        <span className="text-green-600 text-[11px] font-normal">
                                            (보유중)
                                        </span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="text-right font-semibold mb-2">
                    총 가격: {totalPrice} GP
                </div>

                <button
                    className="mt-4 w-full bg-purple-600 text-white py-2 rounded disabled:opacity-50"
                    disabled={totalPrice === 0 || totalPrice > gp || buyingAll}
                    onClick={handleBuyAll}
                >
                    {buyingAll ? "구매중…" : `모두 구매하기 (${totalPrice} GP)`}
                </button>
            </div>
        </div>
    );
}
