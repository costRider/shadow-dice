// src/components/gamelobby/EditRoomModal.jsx
import React, { useState } from "react";
import { toast } from "@/context/ToastContext";
import { ArrowLeft, ArrowRight } from "lucide-react";

const COST_OPTIONS = [null, 100, 120, 140, 160, 180];

const EditRoomModal = ({
    initialMode,      // boolean: 기존 팀 모드 여부 (true=팀전, false=개인전)
    initialCostLimit, // number|null: 기존 Cost 제한
    onClose,
    onSave
}) => {
    const [teamMode, setTeamMode] = useState(initialMode);
    // initialCostIndex 계산: COST_OPTIONS 배열에서 initialCostLimit 인덱스 찾기
    const initialIndex = COST_OPTIONS.findIndex((v) => v === initialCostLimit);
    const [costIndex, setCostIndex] = useState(initialIndex === -1 ? 0 : initialIndex);

    const prevCost = () => {
        setCostIndex((prev) => (prev === 0 ? COST_OPTIONS.length - 1 : prev - 1));
    };
    const nextCost = () => {
        setCostIndex((prev) => (prev === COST_OPTIONS.length - 1 ? 0 : prev + 1));
    };

    const handleSave = () => {
        const newCostLimit = COST_OPTIONS[costIndex];
        onSave({ mode: teamMode, costLimit: newCostLimit });
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* 배경 오버레이 */}
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>

            <div className="relative z-10 w-[360px] bg-[rgba(10,10,40,0.85)] border border-blue-500 shadow-lg p-6 rounded-xl">
                <h2 className="text-xl font-bold text-yellow-300 mb-4">방 옵션 변경</h2>

                {/* 팀 모드 */}
                <div className="mb-4 flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="editTeamMode"
                        checked={teamMode}
                        onChange={(e) => setTeamMode(e.target.checked)}
                        className="w-4 h-4 text-blue-500 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="editTeamMode" className="text-sm text-blue-200">
                        팀전
                    </label>
                </div>

                {/* Cost 제한 */}
                <div className="mb-6">
                    <label className="block mb-1 text-sm text-blue-200">Cost 제한</label>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={prevCost}
                            className="p-1 bg-[rgba(255,255,255,0.1)] border border-blue-400 rounded hover:bg-[rgba(255,255,255,0.2)] transition"
                        >
                            <ArrowLeft size={16} className="text-blue-200" />
                        </button>
                        <span className="px-2 text-sm text-white">
                            {COST_OPTIONS[costIndex] === null
                                ? "무제한"
                                : `${COST_OPTIONS[costIndex]} 이하`}
                        </span>
                        <button
                            onClick={nextCost}
                            className="p-1 bg-[rgba(255,255,255,0.1)] border border-blue-400 rounded hover:bg-[rgba(255,255,255,0.2)] transition"
                        >
                            <ArrowRight size={16} className="text-blue-200" />
                        </button>
                    </div>
                </div>

                {/* 버튼 그룹 */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                        변경
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditRoomModal;
