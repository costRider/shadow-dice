import React, { useState, useMemo } from "react";
import { useShopItems, usePurchase } from "@/hooks/useShop";
import { useAvatar } from "@/context/AvatarContext";
import useAuth from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import AvatarPreview from "@/components/ui/AvatarPreview";

export default function AvatarCostumeShopTab() {
    const toast = useToast();
    const { user } = useAuth();
    const gp = user?.gp ?? 0;

    const { items, loading, error, refetch } =
        useShopItems("avatar_costume");
    const { purchase } = usePurchase();
    const { gender, avatarState, previewEquip, resetEquip } =
        useAvatar();

    const [buyingAll, setBuyingAll] = useState(false);

    // ─── 1) 성별 필터 ───
    const genderedItems = useMemo(
        () => items.filter(it => it.metadata.gender === gender),
        [items, gender]
    );

    // ─── 2) 선택된 아이템 & 총합 ───
    const selectedItems = useMemo(() => {
        return Object.entries(avatarState.equippedItems)
            .map(([part, id]) =>
                genderedItems.find(it => it.target_id === id && it.metadata.part === part)
            )
            .filter(Boolean);
    }, [avatarState.equippedItems, genderedItems]);

    const totalPrice = useMemo(
        () => selectedItems.reduce((sum, it) => sum + it.price, 0),
        [selectedItems]
    );

    // ─── 3) 개별 구매 ───
    const handleBuy = async id => {
        const ok = await purchase(id);
        if (ok) {
            toast("🎉 구매되었습니다!");
            await refetch();
        } else {
            toast("구매 실패");
        }
    };

    // ─── 4) 모두 구매 ───
    const handleBuyAll = async () => {
        if (totalPrice === 0) return;
        if (totalPrice > gp) {
            toast("⚠️ GP가 부족합니다.");
            return;
        }
        setBuyingAll(true);
        for (const it of selectedItems) {
            if (!it.owned) {
                const ok = await purchase(it.id);
                if (!ok) toast(`’${it.metadata.name}’ 구매 실패`);
            }
        }
        await refetch();
        setBuyingAll(false);
        toast("선택 코스튬을 모두 구매했습니다! 🎉");
    };

    if (loading) return <div>로딩 중…</div>;
    if (error) return <div>상품 불러오기 실패: {error.message}</div>;

    return (
        <div className="flex">
            {/* ─── 좌측: 그리드 ─── */}
            <div className="w-2/3 max-h-[500px] overflow-y-auto pr-2">
                <div className="grid grid-cols-3 gap-4">
                    {genderedItems.map(item => {
                        const { id, price, owned, metadata: m, target_id } = item;
                        const part = m.part;

                        return (
                            <div key={id} className="border p-2 rounded flex flex-col items-center">
                                <img
                                    src={item.thumbnailUrl}
                                    alt={m.name}
                                    className="w-24 h-24 object-contain mb-2"
                                />
                                <div className="font-semibold text-center text-sm">
                                    {m.name}
                                </div>
                                <div className="text-xs text-gray-500">GP {price}</div>

                                {owned ? (
                                    <button
                                        className="mt-1 px-2 py-1 bg-gray-400 text-white rounded text-xs"
                                        onClick={() => previewEquip({ partCode: part, itemId: target_id })}
                                    >
                                        {avatarState.equippedItems[part] === target_id
                                            ? "해제"
                                            : "보유중"}
                                    </button>
                                ) : (
                                    <div className="mt-1 flex space-x-1">
                                        <button
                                            className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                                            onClick={() => previewEquip({ partCode: part, itemId: target_id })}
                                        >
                                            착용 미리보기
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

            {/* ─── 우측: 미리보기 ─── */}
            <div className="w-1/3 pl-4">
                <h3 className="text-lg font-bold mb-2">현재 착용 상태</h3>
                <button
                    className="px-2 py-1 text-xs bg-red-200 rounded hover:bg-red-300 mb-2"
                    onClick={resetEquip}
                >
                    장착 초기화
                </button>
                <div className="border p-4 rounded mb-4">
                    <AvatarPreview state={avatarState} />
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
