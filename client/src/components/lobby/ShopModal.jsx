// src/components/ShopModal.jsx
import React, { useState } from 'react';
import Tab from '@/components/ui/Tab'; // 이미 만든 탭 컴포넌트
import CharacterShopTab from './CharacterShopTab';
import AvatarCostumeShopTab from './AvatarCostumeShopTab';

export default function ShopModal({ onClose }) {
    const [activeTab, setActiveTab] = useState('character');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg w-11/12 max-w-4xl p-6 relative">
                {/* 닫기 */}
                <button
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
                    onClick={onClose}
                >
                    ✕
                </button>

                <h2 className="text-2xl font-bold mb-4">상점</h2>
                <Tab
                    tabs={[
                        { key: 'character', label: '말(캐릭터) 구매' },
                        { key: 'avatar_costume', label: '아바타 코스튬 구매' },
                    ]}
                    activeKey={activeTab}
                    onChange={setActiveTab}
                />

                <div className="mt-6">
                    {activeTab === 'character' && <CharacterShopTab />}
                    {activeTab === 'avatar_costume' && <AvatarCostumeShopTab />}
                </div>
            </div>
        </div>
    );
}
