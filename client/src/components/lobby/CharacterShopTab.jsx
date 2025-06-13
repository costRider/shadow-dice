import React, { useState } from 'react';
import SpriteAnimator from '@/components/SpriteAnimator';
import { useToast } from '@/context/ToastContext';
import { useShopItems, usePurchase } from '@/hooks/useShop';

export default function CharacterShopTab() {
    const toast = useToast();
    const { items, loading, error, refetch } = useShopItems('character');
    const { purchase, loading: buying, error: buyError } = usePurchase();
    const [previewItem, setPreviewItem] = useState(null);

    const onBuy = async (id) => {
        const { success, message } = await purchase(id);
        if (success) {
            // 구매 성공
            toast('🎉 구매되었습니다!');
            await refetch();
        } else {
            toast(`구매 실패: ${message}`);
        }
    };

    if (loading) return <div>로딩 중…</div>;
    if (error) return <div>상품 불러오기 실패: {error.message || error}</div>;

    return (
        <div className="flex">
            {/* ── 상품 리스트 ── */}
            <div className="w-2/3 max-h-[500px] overflow-y-auto pr-2">
                <div className="grid grid-cols-3 gap-4">
                    {items.map(item => {
                        const meta = item.metadata;  // 이미 파싱된 오브젝트
                        return (
                            <div
                                key={item.id}
                                className="border p-2 rounded flex flex-col items-center"
                            >
                                <img
                                    src={item.thumbnailUrl}
                                    alt={meta.name}
                                    className="w-24 h-24 object-contain mb-2"
                                />
                                <div className="font-semibold text-center text-sm">{meta.name}</div>
                                <div className="text-xs text-gray-500">GP {item.price}</div>
                                {/* 보유 여부에 따라 버튼 분기 */}
                                {item.owned ? (
                                    <button
                                        className="mt-2 px-2 py-1 bg-gray-400 text-white rounded text-xs"
                                        onClick={() => setPreviewItem(item)}
                                    >
                                        보유중
                                    </button>
                                ) : (
                                    <div className="mt-2 flex space-x-1">
                                        <button
                                            className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                                            onClick={() => setPreviewItem(item)}
                                        >미리보기</button>
                                        <button
                                            className="px-2 py-1 bg-green-500 text-white rounded text-xs"
                                            disabled={buying}
                                            onClick={() => onBuy(item.id)}
                                        >
                                            {buying ? '구매중…' : '구매'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── 미리보기 & 메타데이터 ── */}
            <div className="w-1/3 pl-4">
                {previewItem ? (
                    <>
                        <h3 className="text-lg font-bold mb-2">
                            {previewItem.metadata.name} 미리보기
                        </h3>

                        <div className="flex justify-center items-center mb-4">
                            <SpriteAnimator
                                key={previewItem.id}
                                jsonUrl={previewItem.previewJson}
                                imageUrl={previewItem.previewImg}
                                fps={12}
                                loop
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {(() => {
                                const m = previewItem.metadata;
                                const rows = [
                                    { label: '이동', value: m.move },
                                    { label: '공격', value: m.attack },
                                    { label: '방어', value: m.def },
                                    { label: '지력', value: m.int },
                                    { label: '가격', value: `${previewItem.price} GP` },
                                    { label: 'Cost', value: m.cost },
                                    { label: '타입', value: m.type },
                                    // 능력만 extra(description) 포함, 그리고 col-span-2
                                    { label: 'Ability', value: m.ability, extra: m.description, span: 2 },
                                ];

                                return rows.map(({ label, value, extra, span }) => (
                                    <div
                                        key={label}
                                        className={`flex justify-between items-center
          ${span ? `col-span-${span}` : ''}
        `}
                                    >
                                        <span className="font-medium">{label}:</span>
                                        <span>
                                            {value}
                                            {extra && <span className="text-gray-500 ml-1">({extra})</span>}
                                        </span>
                                    </div>
                                ));
                            })()}
                        </div>
                    </>
                ) : (
                    <div className="text-gray-400">상품을 클릭해 미리보기를 확인하세요.</div>
                )}
            </div>
        </div>
    );
}
