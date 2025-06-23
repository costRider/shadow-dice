
import { getRandomItem } from "@/components/game/utils/itemUtils";
// src/components/game/tileEffects.js

// 게임 외부에서 재사용 가능한 이동 재호출 핸들러는 외부에서 주입받음
let tileEffectHandlers = {
    forceMoveHandler: (steps, fromId, endTurnCallback) => { },
    forceMoveBackward: (steps, playerId, cb) => handleBackwardMove(steps, playerId, cb),
    setDiceLimitMap: () => { },
    getTiles: () => [], // 👈 기본값
};

export function setTileEffectHandlers(handlers) {
    tileEffectHandlers = { ...tileEffectHandlers, ...handlers };
}

const questionTypes = [
    "NORMAL", "BLESS", "CURSE", "TREASURE", "PLUS3", "PLUS4", "SPADE", "CLOVER", "TAX"
    , "ABIL25", "ABIL", "BATTLE", "DOA", "PRISON", "DISK", "WAND", "SWORD", "CUP"
];

// 더미 함수 (실제 게임 로직과 연결 시 교체 필요)
function addItemToPlayer(player, ...items) {
    if (!player.items) player.items = [];
    player.items.push(...items);
}

function clearItems(player) {
    player.items = [];
}

export function handleTileEffect(tileType, player, tileId = null, jokerTempMap) {
    const questionTileMap = tileEffectHandlers.getQuestionTileMap?.();

    if (jokerTempMap?.[tileId]) {
        console.log(`🃏 [JOKER] 임시 타입 → ${jokerTempMap[tileId]}`);
        tileType = jokerTempMap[tileId];
    }

    if (tileType === "QUESTION" && tileId != null) {
        const replaced = questionTileMap[tileId];
        if (replaced) {
            console.log(`❓ QUESTION 유지 → [${tileId}]은 이미 ${replaced}으로 결정됨`);
            tileType = replaced;
        } else {
            const newType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
            console.log(`🎲 QUESTION 결정: [${tileId}] → ${newType}`);
            tileEffectHandlers.updateQuestionTileMap?.(tileId, newType);
            tileType = newType;
        }
    }

    const effects = {
        NORMAL: () => console.log("[NORMAL] 효과 없음"),
        PRACTICE: () => console.log("[PRACTICE] 효과 없음"),

        TREASURE: () => {
            const itemCount = player.items?.length || 0;
            if (itemCount >= 5) {
                console.log("📦 보물상자: 아이템 가득 참 (획득 불가)");
            } else {
                const newItem = getRandomItem();
                addItemToPlayer(player, newItem);
                console.log("📦 보물상자: 아이템 1장 획득!", newItem);
            }
        },

        CURSE: () => {
            const itemCount = player.items?.length || 0;
            if (itemCount === 0) {
                console.log("💀 저주 발동: 잃을 아이템 없음");
            } else {
                clearItems(player);
                console.log("💀 저주 발동: 아이템 전부 소멸");
            }
        },

        BLESS: () => {
            const count = player.items?.length || 0;
            const MAX_ITEMS = 5;

            if (count >= MAX_ITEMS) {
                console.log("🙏 [BLESS] 아이템 가득 참: 보급 생략");
                return;
            }

            const needed = MAX_ITEMS - count;
            const newItems = Array.from({ length: needed }, () => getRandomItem());
            addItemToPlayer(player, ...newItems);
            console.log(`🙏 [BLESS] 아이템 ${needed}장 보급됨`, newItems);
        },

        PLUS3: () => (fromId, endTurnCallback) => {
            console.log("⏩ PLUS3: 3칸 추가 전진");
            tileEffectHandlers.forceMoveHandler(3, fromId, endTurnCallback);
        },

        PLUS4: () => (fromId, endTurnCallback) => {
            console.log("⏩ PLUS4: 4칸 추가 전진");
            tileEffectHandlers.forceMoveHandler(4, fromId, endTurnCallback);
        },

        SPADE: () => {
            const userId = player.id;
            console.log("🕳️ SPADE: 다음 턴 주사위 제한(최대 3)");
            tileEffectHandlers.setDiceLimitMap(prev => ({
                ...prev,
                [userId]: "SPADE"
            }));
        },

        CLOVER: () => {
            const userId = player.id;
            console.log("🍀 CLOVER: 다음 턴 주사위 상향(4~6)");
            tileEffectHandlers.setDiceLimitMap(prev => ({
                ...prev,
                [userId]: "CLOVER"
            }));
        },

        GOAL: () => (cb) => {
            const gp = player.gp || 0;
            const taxRate = player.taxRate || 0;
            const taxed = Math.floor(gp * (1 - taxRate / 100));

            console.log("🏁 GOAL 도착: 게임 종료 트리거");
            console.log(`🧾 보유 GP: ${gp} | 세율: ${taxRate}% → 최종 보상: ${taxed}GP`);

            tileEffectHandlers.onGameEnd?.();
            cb?.();
        },

        TAX: () => (fromTileId, endTurnCallback) => {
            const gp = player.gp || 0;
            const taxRate = player.taxRate || 0;
            console.log("💰 [TAX] 세금 주사위 굴리기 대기 중...");
            tileEffectHandlers.awaitTaxRoll(player.id, endTurnCallback);
            console.log(`🧾 보유 GP: ${gp} | 세율: ${taxRate}%`);
        },

        START: () => (cb) => {
            console.log("🔄 START 타일 도착: 시작 지점입니다.");
            // 향후 외부 트리거에서 START 복귀 시 여기로 오게 될 수 있음
            cb?.();
        },

        ABIL25: () => {
            if (typeof player.abilityGauge !== "number") {
                player.abilityGauge = 0;
            }

            const before = player.abilityGauge;
            const increased = Math.min(100, before + 25);

            if (before >= 100) {
                console.log("💯 [ABIL25] 이미 최대 게이지 도달");
            } else {
                player.abilityGauge = increased;
                console.log(`🧪 [ABIL25] 게이지 +25% → 현재: ${increased}%`);
            }
        },

        ABIL: () => (fromTileId, endTurnCallback) => {
            console.log("🧪 [ABIL] 주사위 두 번 굴리기 대기 시작");
            tileEffectHandlers.awaitAbilityRoll(player.id, endTurnCallback);
        },

        QUESTION: () => () => {
            // 위에서 처리했으므로 이건 빈 함수
        },

        JOKER: () => (tileId, endTurnCallback) => {
            if (!tileId) {
                console.warn("⚠️ [JOKER] tileId 누락");
                endTurnCallback?.();
                return;
            }

            const newType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
            console.log(`🃏 [JOKER] ${tileId} → ${newType}로 임시 변경`);

            tileEffectHandlers.updateJokerTempType?.(tileId, newType);

            const result = handleTileEffect(newType, player, tileId);
            console.log("tile Effects 결과값 확인:", result);
            if (typeof result === "function") {
                result(tileId, () => {
                    setTimeout(() => {
                        tileEffectHandlers.revertJokerTile?.(tileId);
                    }, 100); // 턴 종료 이후 안전하게 복원
                    endTurnCallback?.();
                });
            } else {
                setTimeout(() => {
                    tileEffectHandlers.revertJokerTile?.(tileId);
                }, 100); // 턴 종료 이후 안전하게 복원
                endTurnCallback?.();
            }
        },

        BATTLE: () => {
            return async (tileId, endTurnCallback) => {
                const allPlayers = tileEffectHandlers.getAllPlayers?.();
                const currentPlayer = tileEffectHandlers.getCurrentPlayer?.();

                if (!Array.isArray(allPlayers) || !currentPlayer) {
                    console.warn("❌ [BATTLE] 전투 불가: 플레이어 정보 없음");
                    endTurnCallback?.();
                    return;
                }

                const defender = allPlayers.find(p =>
                    p.id !== currentPlayer.id &&
                    p.position === tileId
                );

                if (!defender) {
                    console.log("⚠️ [BATTLE] 상대 없음 → 전투 생략");
                    endTurnCallback?.();
                    return;
                }

                console.log("⚔️ [BATTLE] 전투 발생:", currentPlayer.nickname, "vs", defender.nickname);
                await tileEffectHandlers.triggerBattle?.({
                    attacker: currentPlayer,
                    defender,
                    tileId,
                    onBattleEnd: endTurnCallback,
                });
            };

        },

        PRISON: () => {
            console.log("🚫 [PRISON] 감옥 효과 발동! 3턴 이동 금지 + 탈출 주사위 기회 제공");
            tileEffectHandlers.setPrisonTurn?.(player.id, 3);
        },

        DOA: () => {
            return async (tileId, endTurnCallback, player) => {
                if (!player) {
                    console.warn("[DOA] 현재 플레이어 없음");
                    endTurnCallback?.();
                    return;
                }

                const target = Math.floor(Math.random() * 6) + 1;
                console.log("🎯 [DOA] 목표 수:", target, "→ 대상 플레이어:", player.nickname);

                tileEffectHandlers.awaitDOARoll?.(player.id, target, endTurnCallback);

            };
        },

        WARP1: () => async (fromId, endTurnCallback) => {
            console.log("타일 타입 확인:", tileType);
            const tiles = tileEffectHandlers.getTiles(); // ✅ getTiles로 타일 가져오기
            const group = tiles.filter(t => t.type === "WARP1" && t.id !== fromId);
            if (group.length > 0) {
                const target = group[Math.floor(Math.random() * group.length)];
                console.log("🔀 [WARP1] →", target.id);
                await tileEffectHandlers.moveTo(target.id);
            }
            endTurnCallback?.();
        },

        WARP2: () => async (fromId, endTurnCallback) => {
            const tiles = tileEffectHandlers.getTiles();
            const current = tiles.find(t => t.id === fromId);
            if (!current || typeof current.order !== "number") {
                console.warn("⚠️ [WARP2] 현재 타일의 order 누락");
                return endTurnCallback?.();
            }
            console.log("타일확인: ", tiles, "현재타일:", current);
            const targets = tiles.filter(t =>
                t.type === "WARP2" &&
                t.id !== fromId &&
                typeof t.order === "number" &&
                t.order < current.order
            );

            if (targets.length > 0) {
                const target = targets[Math.floor(Math.random() * targets.length)];
                console.log("🔀 [WARP2] 뒤로 이동 →", target.id);
                await tileEffectHandlers.moveTo(target.id);
            } else {
                console.warn("⚠️ [WARP2] 뒤로 이동 가능한 타일 없음");
            }
            endTurnCallback?.();
        },



        WARP3: () => async (fromId, endTurnCallback) => {
            const tiles = tileEffectHandlers.getTiles();
            const current = tiles.find(t => t.id === fromId);
            if (!current || typeof current.order !== "number") {
                console.warn("⚠️ [WARP3] 현재 타일의 order 누락");
                return endTurnCallback?.();
            }

            const targets = tiles.filter(t =>
                t.type === "WARP3" &&
                t.id !== fromId &&
                typeof t.order === "number" &&
                t.order > current.order
            );

            if (targets.length > 0) {
                const target = targets[Math.floor(Math.random() * targets.length)];
                console.log("🔀 [WARP3] 앞으로 이동 →", target.id);
                await tileEffectHandlers.moveTo(target.id);
            } else {
                console.warn("⚠️ [WARP3] 앞으로 이동 가능한 타일 없음");
            }
            endTurnCallback?.();
        },

        DISK: () => {
            console.log("🧿 [DISK] 맵 속성이 DISK로 변경됩니다.");
            tileEffectHandlers.setMapAttribute?.("DISK");
        },

        WAND: () => {
            console.log("🔮 [WAND] 맵 속성이 WAND로 변경됩니다.");
            tileEffectHandlers.setMapAttribute?.("WAND");
        },

        SWORD: () => {
            console.log("🗡️ [SWORD] 맵 속성이 SWORD로 변경됩니다.");
            tileEffectHandlers.setMapAttribute?.("SWORD");
        },

        CUP: () => {
            console.log("🍷 [CUP] 맵 속성이 CUP로 변경됩니다.");
            tileEffectHandlers.setMapAttribute?.("CUP");
        },


        /*
                WARP1: () => console.log("[WARP1] 동일한 WARP1 타일로 이동합니다.(양방향)(미구현)"),
                WARP2: () => console.log("[WARP2] 동일한 WARP2 타일로 이동합니다.(단방향: 뒤로만)(미구현)"),
                WARP3: () => console.log("[WARP3] 동일한 WARP2 타일로 이동합니다.(단방향: 앞으로만)(미구현)"),
                DISK: () => console.log("[DISK] 맵 속성을 DISK 속성으로 변경합니다. (미구현)"),
                WAND: () => console.log("[WAND] 맵 속성을 WAND 속성으로 변경합니다. (미구현)"),
                SWORD: () => console.log("[SWORD] 맵 속성을 SWORD 속성으로 변경합니다. (미구현)"),
                CUP: () => console.log("[CUP] 맵 속성을 CUP 속성으로 변경합니다. (미구현)"),
           */

    };

    const effectFn = effects[tileType] || (() => console.warn(`❓ 처리되지 않은 타일 효과: ${tileType}`));
    return effectFn(player);

}