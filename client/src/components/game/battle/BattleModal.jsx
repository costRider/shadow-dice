import React, { useEffect, useState } from "react";
import BattleManager from "./BattleManager";

export default function BattleModal({ onBattleResolved }) {
    const [state, setState] = useState(null);

    useEffect(() => {
        const unsubscribe = BattleManager._state.subscribe(setState);
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (state?.result && onBattleResolved && state.battleTurn?.current === "end") {
            onBattleResolved(state.result);
        }
    }, [state?.result, state?.battleTurn?.current, onBattleResolved]);

    if (!state) return null;

    const { attacker, defender, attackRoll, defenseRoll, battleTurn } = state;

    const buttonUI = () => {
        const current = battleTurn?.current;
        if (current === "item-attacker" || current === "item-defender") {
            return (
                <button
                    onClick={BattleManager.resolveItemPhase}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    아이템/어빌리티 사용 완료
                </button>
            );
        }
        if (current === "attacker" && attackRoll === null) {
            return (
                <button
                    onClick={() => BattleManager.rollAttack(Math.floor(Math.random() * 6) + 1)}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    공격자 주사위 굴리기
                </button>
            );
        }
        if (current === "defender" && defenseRoll === null) {
            return (
                <button
                    onClick={() => BattleManager.rollDefense(Math.floor(Math.random() * 6) + 1)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                >
                    방어자 주사위 굴리기
                </button>
            );
        }
        if (current === "end") {
            return (
                <div className="text-green-600 font-bold">
                    전투 종료: {state.result?.loserId === attacker.id ? "공격자 패배" : "방어자 패배"}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg text-center space-y-4 w-[360px]">
                <div className="text-xl font-bold">⚔️ 전투 시작 ⚔️</div>

                <div className="flex justify-between text-left text-sm font-mono px-2">
                    <div>
                        <p>공격자: {attacker.nickname}</p>
                        <p>{attackRoll !== null ? `🎲 ${attackRoll}` : "대기 중..."}</p>
                    </div>
                    <div>
                        <p>방어자: {defender.nickname}</p>
                        <p>{defenseRoll !== null ? `🎲 ${defenseRoll}` : "대기 중..."}</p>
                    </div>
                </div>

                {buttonUI()}
            </div>
        </div>
    );
}
