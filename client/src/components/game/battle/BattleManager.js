let resolveAttack;
let resolveDefense;
let resolveItemPhase;
let hasEnded = false;

function applyAttackBonus(baseRoll, attacker, mapAttr) {
    if (mapAttr === "SWORD" && attacker.chessmanType === "SWORD") {
        console.log("🗡️ SWORD 속성 보정 +2 (공격자)");
        return baseRoll + 2;
    } else if (mapAttr === "CUP" && attacker.chessmanType === "SWORD") {
        console.log("🍷 CUP 속성 보정 -2 (공격자)");
        return baseRoll - 2;
    }
    return baseRoll;
}

function applyDefenseBonus(baseRoll, defender, mapAttr) {
    if (mapAttr === "WAND" && defender.chessmanType === "WAND") {
        console.log("🔮 WAND 속성 보정 +2 (방어자)");
        return baseRoll + 2;
    } else if (mapAttr === "DISK" && defender.chessmanType === "WAND") {
        console.log("🧿 DISK 속성 보정 -2 (방어자)");
        return baseRoll - 2;
    }
    return baseRoll;
}

const BattleManager = {
    _state: (() => {
        const subscribers = [];
        let value = null;
        return {
            subscribe(fn) {
                subscribers.push(fn);
                if (value) fn(value);
                return () => {
                    const i = subscribers.indexOf(fn);
                    if (i >= 0) subscribers.splice(i, 1);
                };
            },
            set(newVal) {
                console.log("[🔄 BattleManager] 상태 업데이트:", newVal);
                value = newVal;
                subscribers.forEach((fn) => fn(value));
            },
            get() {
                return value;
            },
        };
    })(),

    startBattle({ attacker, defender, onEnd, mapAttribute = "NONE" }) {
        console.log("🟢 [startBattle] 전투 시작 요청:", attacker.nickname, "vs", defender.nickname);
        BattleManager._state.set(null);
        resolveItemPhase = null;
        resolveAttack = null;
        resolveDefense = null;

        return new Promise((resolve) => {
            const initialState = {
                attacker,
                defender,
                onEnd,
                attackRoll: null,
                defenseRoll: null,
                result: null,
                mapAttribute, // ✅ 추가
                battleTurn: {
                    attackerId: attacker.id,
                    defenderId: defender.id,
                    current: "item-attacker",
                },
            };

            console.log("🆕 [startBattle] 초기 상태 설정:", initialState);
            BattleManager._state.set(initialState);

            resolveItemPhase = () => {
                const prev = BattleManager._state.get();
                if (!prev) return;

                const nextTurn =
                    prev.battleTurn.current === "item-attacker"
                        ? "item-defender"
                        : "attacker";

                console.log(`⏭️ [resolveItemPhase] 단계 전환: ${prev.battleTurn.current} → ${nextTurn}`);

                BattleManager._state.set({
                    ...prev,
                    battleTurn: {
                        ...prev.battleTurn,
                        current: nextTurn,
                    },
                });
            };

            resolveAttack = (roll) => {
                const prev = BattleManager._state.get();
                if (!prev) return;

                const adjustedRoll = applyAttackBonus(roll, prev.attacker, prev.mapAttribute);
                console.log(`🎲 [resolveAttack] 원본:${roll}, 보정 후:${adjustedRoll}`);

                BattleManager._state.set({
                    ...prev,
                    attackRoll: adjustedRoll,
                    battleTurn: { ...prev.battleTurn, current: "defender" },
                });
            };

            resolveDefense = (roll) => {
                const prev = BattleManager._state.get();
                if (!prev || prev.attackRoll == null) return;

                const { defender, attackRoll, onEnd, mapAttribute } = prev;

                const adjustedRoll = applyDefenseBonus(roll, prev.defender, prev.mapAttribute);
                console.log(`🛡️ [resolveDefense] 원본:${roll}, 보정 후:${adjustedRoll}`);

                if (attackRoll === adjustedRoll) {
                    console.log("⚔️ [resolveDefense] 재전투 발생! (동일한 주사위)");
                    BattleManager._state.set(null);
                    resolveItemPhase = null;
                    resolveAttack = null;
                    resolveDefense = null;
                    asEnded = false;
                    setTimeout(() => {
                        console.log("🔁 [resolveDefense] 재전투 시작");
                        BattleManager.startBattle({ attacker, defender, onEnd, mapAttribute });
                    }, 300);
                    return;
                }

                const diff = Math.abs(attackRoll - adjustedRoll);
                const loserId = attackRoll > adjustedRoll ? defender.id : attacker.id;
                const backToStart = diff >= 7;
                const result = { loserId, stepsBack: backToStart ? 0 : diff, backToStart };

                console.log("✅ [resolveDefense] 전투 결과:", result);

                BattleManager._state.set({
                    ...prev,
                    defenseRoll: roll,
                    result,
                    battleTurn: { ...prev.battleTurn, current: "end" },
                });

                setTimeout(() => {
                    console.log("🧹 [resolveDefense] 전투 종료 후 상태 초기화 및 후처리");
                    if (hasEnded) return;
                    hasEnded = true;

                    resolveItemPhase = null;
                    resolveAttack = null;
                    resolveDefense = null;
                    BattleManager._state.set(null);
                    queueMicrotask(() => {
                        console.log("📤 [resolveDefense] onEnd 콜백 호출");
                        onEnd?.(result);
                        resolve();
                    });
                }, 300);
            };
        });
    },

    resolveItemPhase() {
        console.log("🟡 [BattleManager] resolveItemPhase 호출됨");
        resolveItemPhase?.();
    },

    rollAttack(roll) {
        console.log("🔴 [BattleManager] rollAttack 호출됨:", roll);
        resolveAttack?.(roll);
    },

    rollDefense(roll) {
        console.log("🔵 [BattleManager] rollDefense 호출됨:", roll);
        resolveDefense?.(roll);
    },
};

export default BattleManager;
