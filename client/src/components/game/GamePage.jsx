// ✅ GamePage.jsx (최종 리팩토링: 전투 + 타일 효과 + 분기 + 세금/어빌리티 UI 복구 및 전투 턴 통합)
import React, { useState, useEffect, useCallback, useRef } from "react";
import TileMap from "./TileMap";
import PlayerPiece from "./PlayerPiece";
import DicePanel from "./DicePanel";
import BattleManager from "./battle/BattleManager";
import BattleModal from "./battle/BattleModal";
//import { tiles } from "@/data/testTiles";
import { handleTileEffect, setTileEffectHandlers } from "@/components/game/tileEffects";
import { getRandomItem } from "@/components/game/utils/itemUtils";

export default function GamePage({ initialPlayers }) {
    const [tiles, setTiles] = useState([]);
    const [map, setMap] = useState(null);
    const [players, setPlayers] = useState(initialPlayers);
    const [currentTurn, setCurrentTurn] = useState(0);
    const [dice, setDice] = useState(null);
    const [isMoving, setIsMoving] = useState(false);
    const [cameraPos, setCameraPos] = useState(() => {
        const t = tiles[0];
        return t ? { x: t.x, y: t.y } : { x: 0, y: 0 };
    });
    const [shufflingTileMap, setShufflingTileMap] = useState({});
    const [isWaitingDirection, setIsWaitingDirection] = useState(false);
    const [availableDirections, setAvailableDirections] = useState(null);
    const [remainingSteps, setRemainingSteps] = useState(0);
    const [diceLimitMap, setDiceLimitMap] = useState({});
    const [gameEnded, setGameEnded] = useState(false);
    const [awaitingTaxRoll, setAwaitingTaxRoll] = useState(false);
    const [pendingTaxPlayerId, setPendingTaxPlayerId] = useState(null);
    const taxEndTurnRef = useRef(null);
    const [awaitingAbilityRoll, setAwaitingAbilityRoll] = useState(false);
    const [pendingAbilityPlayerId, setPendingAbilityPlayerId] = useState(null);
    const [abilityRolls, setAbilityRolls] = useState([]);
    const abilityEndTurnRef = useRef(null);
    const [questionTileMap, setQuestionTileMap] = useState({});
    const [jokerTempMap, setJokerTempMap] = useState({});
    const savedTurnRef = useRef(null);
    const [prisonTurnMap, setPrisonTurnMap] = useState({});
    const [awaitingDOARoll, setAwaitingDOARoll] = useState(false);
    const [doaTarget, setDoaTarget] = useState(null);
    const doaEndTurnRef = useRef(null);
    const [mapAttribute, setMapAttribute] = useState("NONE");
    const [currentPlayerTurnVisible, setCurrentPlayerTurnVisible] = useState(false);

    const getStartTileId = () => tiles.find(t => t.type === "START")?.id || 0;

    const defaultEndTurn = useCallback(() => {
        setIsMoving(false);
        setCurrentTurn(prev => {
            const next = (prev + 1) % players.length;
            const nextPlayer = players[next];
            const nextTile = tiles.find(t => t.id === nextPlayer.position);
            if (nextTile) {
                setCameraPos({ x: nextTile.x, y: nextTile.y });
                console.log("🎯 [턴 전환] 다음 플레이어:", nextPlayer.nickname);
                console.log("📸 [카메라 이동] 좌표:", nextTile.x, nextTile.y);
            }
            // 👇 중앙 메시지 표시
            setCurrentPlayerTurnVisible(true);
            setTimeout(() => setCurrentPlayerTurnVisible(false), 2000);

            return next;
        });
    }, [players]);

    const handleBackwardMove = async (steps, playerId, endTurnCallback = defaultEndTurn) => {
        const player = players.find(p => p.id === playerId);
        if (!player || !player.movePath) return endTurnCallback();

        const path = [...player.movePath];
        path.pop(); // 현재 위치 제거
        const backPath = path.slice(-steps).reverse();
        console.log("🔙 [역방향 이동]", backPath);

        for (const id of backPath) {
            await new Promise(r => setTimeout(r, 300));
            await moveTo(id);
        }
        endTurnCallback();
    };

    const moveTo = async (id) => {
        const tile = tiles.find(t => t.id === id);
        if (!tile) return;
        console.log("🚶 [moveTo] 타일 이동:", id);
        setPlayers(prev => {
            const updated = [...prev];
            updated[currentTurn] = {
                ...updated[currentTurn],
                position: id,
                gp: (updated[currentTurn].gp || 0) + 1,
                movePath: [...(updated[currentTurn].movePath || []), id],
            };
            return updated;
        });
        setCameraPos({ x: tile.x, y: tile.y });
        return tile.id;
    };

    const handleDOADiceRoll = () => {
        const player = players[currentTurn];
        const rolled = Math.floor(Math.random() * 6) + 1;
        console.log("🎯 [DOA] 목표값:", doaTarget, "/ 사용자 주사위:", rolled);
        const diff = Math.abs(doaTarget - rolled);
        if (diff === 0) {
            console.log("✅ [DOA] 값 일치 → 통과");
            doaEndTurnRef.current?.();
        } else if (diff <= 2) {
            console.log(`🔁 [DOA] ${diff} 차이 → ${diff * 2}칸 후퇴`);
            handleBackwardMove(diff * 2, player.id, doaEndTurnRef.current);
        } else {
            console.log("🏚️ [DOA] 차이 3 이상 → START로 이동");
            moveTo(getStartTileId());
            doaEndTurnRef.current?.();
        }
        setAwaitingDOARoll(false);
        setDoaTarget(null);
    };

    const handleMoveStep = async (steps, currentId, endTurnCallback = defaultEndTurn) => {
        console.log("🧭 [handleMoveStep] 이동 시작:", steps, "현재 타일:", currentId);
        const tile = tiles.find(t => t.id === currentId);
        if (!tile) return;

        const dirKeys = Object.keys(tile.directions || {});
        if (dirKeys.length > 1) {
            console.log("🔀 분기 선택 필요:", dirKeys);
            setIsWaitingDirection(true);
            setAvailableDirections(tile.directions);
            setRemainingSteps(steps);
            return;
        }
        if (dirKeys.length === 0) return endTurnCallback();

        const nextId = tile.directions[dirKeys[0]];
        await new Promise(r => setTimeout(r, 400));
        await moveTo(nextId);

        const nextStep = steps - 1;
        const player = players[currentTurn];
        const nextTile = tiles.find(t => t.id === nextId);

        if (gameEnded) return;

        // 전투 감지
        if (nextTile?.type === "BATTLE") {
            const defender = players.find(p => p.id !== player.id && p.position === nextId);
            if (defender) {
                console.log("⚔️ [전투 시작]", player.nickname, "vs", defender.nickname);
                savedTurnRef.current = currentTurn;
                await BattleManager.startBattle({
                    attacker: player,
                    defender,
                    onEnd: (result) => {
                        handleBattleEnd(result);
                        endTurnCallback();
                    },
                    mapAttribute, // 현재 GamePage state로부터 전달
                });
                return;
            }
        }

        if (nextStep > 0) {
            setTimeout(() => handleMoveStep(nextStep, nextId, endTurnCallback), 400);
        } else {
            const finalTile = tiles.find(t => t.id === nextId);
            const player = players[currentTurn];
            const result = await handleTileEffect(finalTile.type, player, finalTile.id, jokerTempMap);
            if (typeof result === "function") result(nextId, endTurnCallback, player);
            else endTurnCallback();
        }
    };

    const handleBattleEnd = (result) => {
        console.log("🏁 [전투 종료] 결과:", result);
        const { loserId, stepsBack, backToStart } = result || {};
        if (!loserId) return;
        const loser = players.find(p => p.id === loserId);
        console.log("루져:", loser);
        if (!loser) return;

        if (backToStart) {
            const id = getStartTileId();
            moveTo(id);
            return;
        }

        const path = [...(loser.movePath || [])];
        path.pop();
        const backPath = path.slice(-stepsBack);
        const target = backPath[0] || getStartTileId();
        (async () => {
            for (let i = backPath.length - 1; i >= 0; i--) {
                await new Promise(r => setTimeout(r, 300));
                moveTo(backPath[i]);
            }
        })();
    };

    const handleRollDice = () => {
        const player = players[currentTurn];
        const prisonTurns = prisonTurnMap[player.id] || 0;
        if (prisonTurns > 0) {
            console.log(`🚫 [PRISON] ${player.nickname} 감옥 턴 남음:`, prisonTurns);
            const roll1 = Math.floor(Math.random() * 6) + 1;
            const roll2 = Math.floor(Math.random() * 6) + 1;
            console.log("🎲 [PRISON] 탈출 주사위 결과:", roll1, roll2);
            if (roll1 === roll2) {
                console.log("🔓 [PRISON] 탈출 성공!");
                setPrisonTurnMap(prev => {
                    const updated = { ...prev };
                    delete updated[player.id];
                    return updated;
                });
            } else {
                console.log("⛓️ [PRISON] 탈출 실패, 턴 차감");
                setPrisonTurnMap(prev => ({ ...prev, [player.id]: prisonTurns - 1 }));
                defaultEndTurn();
                return;
            }
        }

        const limit = diceLimitMap[player.id];
        const rolled = limit === "SPADE"
            ? Math.floor(Math.random() * 3) + 1
            : limit === "CLOVER"
                ? Math.floor(Math.random() * 3) + 4
                : Math.floor(Math.random() * 6) + 1;

        // 맵 속성에 따른 DISK 이동 보정
        if (player.chessmanType === "DISK" && mapAttribute === "DISK") {
            rolled += 2;
            console.log("📈 [DISK] 맵 속성 보정 +2");
        } else if (player.chessmanType === "DISK" && mapAttribute === "WAND") {
            rolled -= 2;
            console.log("📉 [WAND] 맵 속성 보정 -2");
        }
        //rolled = Math.max(1, rolled); // 최소 1 보장

        console.log("🎲 [주사위] 결과:", rolled);
        setDiceLimitMap(prev => { const p = { ...prev }; delete p[player.id]; return p; });
        setDice(rolled);
        setIsMoving(true);
        setRemainingSteps(rolled);
        handleMoveStep(rolled, player.position);
    };

    const handleChooseDirection = async (dir) => {
        const tile = tiles.find(t => t.id === players[currentTurn].position);
        const nextId = tile.directions[dir];
        setIsWaitingDirection(false);
        setAvailableDirections(null);
        await new Promise(r => setTimeout(r, 400));
        await moveTo(nextId);
        const nextStep = remainingSteps - 1;
        setRemainingSteps(nextStep);
        if (nextStep > 0) {
            setTimeout(() => handleMoveStep(nextStep, nextId), 400);
        } else {
            const finalTile = tiles.find(t => t.id === nextId);
            const player = players[currentTurn];
            const result = await handleTileEffect(finalTile?.type, player, finalTile?.id, jokerTempMap);
            if (typeof result === "function") result(nextId, defaultEndTurn, player);
            else defaultEndTurn();
        }
    };

    const handleTaxRoll = () => {
        const roll = Math.floor(Math.random() * 6) + 1;
        const addTax = roll * 3;
        setPlayers(prev => prev.map(p => p.id === pendingTaxPlayerId ? { ...p, taxRate: (p.taxRate || 0) + addTax } : p));
        setAwaitingTaxRoll(false);
        setPendingTaxPlayerId(null);
        taxEndTurnRef.current?.();
        taxEndTurnRef.current = null;
    };

    const handleAbilityDiceRoll = () => {
        const roll = Math.floor(Math.random() * 6) + 1;
        const updatedRolls = [...abilityRolls, roll];
        setAbilityRolls(updatedRolls);
        if (updatedRolls.length === 2) {
            const updatedPlayers = [...players];
            const abilityPlayer = updatedPlayers.find(p => p.id === pendingAbilityPlayerId);
            if (updatedRolls[0] === updatedRolls[1]) abilityPlayer.abilityGauge = 100;
            console.log("어빌리티 주사위 결과:", updatedRolls);
            setPlayers(updatedPlayers);
            setAwaitingAbilityRoll(false);
            setPendingAbilityPlayerId(null);
            setAbilityRolls([]);
            abilityEndTurnRef.current?.();
            abilityEndTurnRef.current = null;
        }
    };
    // 최초 한 번: 맵 + 타일 정보 가져오기
    useEffect(() => {
        const fetchMapData = async () => {
            const mapRes = await fetch("/api/maps/11");
            const tileRes = await fetch("/api/maps/11/tiles");

            const mapData = await mapRes.json();
            const tileData = await tileRes.json();
            console.log("🔍 directions 원본", tileData.map(t => t.directions));

            setMap(mapData);
            setTiles(tileData);
        };
        fetchMapData();
    }, []);

    // tiles가 준비된 후에 플레이어 초기화
    useEffect(() => {
        if (tiles.length === 0 || initialPlayers.length === 0) return;
        const id = tiles.find(t => t.type === "START")?.id;
        if (id == null) return;

        setPlayers(prev => prev.map(p => ({
            ...p,
            position: id,
            movePath: [id],
            items: Array.from({ length: 3 }, getRandomItem),
            abilityGauge: 0,
        })));
        const tile = tiles.find(t => t.id === id);
        if (tile) setCameraPos({ x: tile.x, y: tile.y });
    }, [tiles, initialPlayers]);
    useEffect(() => {
        const tile = tiles.find(t => t.id === players[currentTurn]?.position);
        if (tile) {
            setCameraPos({ x: tile.x, y: tile.y });
            console.log("🎯 [카메라 동기화] 현재 턴:", players[currentTurn]?.nickname, "→ 위치:", tile.id);
        }
        setTileEffectHandlers({
            setMapAttribute,
            forceMoveHandler: (steps, from, cb) => setTimeout(() => handleMoveStep(steps, from, cb), 400),
            setDiceLimitMap,
            onGameEnd: () => setGameEnded(true),
            awaitTaxRoll: (playerId, cb) => { setPendingTaxPlayerId(playerId); setAwaitingTaxRoll(true); taxEndTurnRef.current = cb; },
            awaitAbilityRoll: (playerId, cb) => { setPendingAbilityPlayerId(playerId); setAwaitingAbilityRoll(true); abilityEndTurnRef.current = cb; },
            getQuestionTileMap: () => questionTileMap,
            updateQuestionTileMap: (tid, val) => setQuestionTileMap(prev => ({ ...prev, [tid]: val })),
            updateJokerTempType: (tid, val) => setJokerTempMap(prev => ({ ...prev, [tid]: val })),
            revertJokerTile: (tid) => setJokerTempMap(prev => { const u = { ...prev }; delete u[tid]; return u; }),
            setPrisonTurn: (playerId, turns) => {
                console.log("🚫 [PRISON]", playerId, "→", turns, "턴 동안 이동 금지");
                setPrisonTurnMap(prev => ({ ...prev, [playerId]: turns }));
            },
            awaitDOARoll: (playerId, target, cb) => {
                console.log("🎯 [DOA] 대기 시작 → 목표:", target);
                setAwaitingDOARoll(true);
                setDoaTarget(target);
                doaEndTurnRef.current = cb;
            },
            moveTo: moveTo,
            getTiles: () => tiles, // ✅ 여기서 tiles 전달
            startTileShuffle: (id, newType, from) => {
                setShufflingTileMap(prev => ({ ...prev, [id]: true }));

                setTimeout(() => {
                    if (from === "question") {
                        setQuestionTileMap(prev => ({ ...prev, [id]: newType }));
                    } else if (from === "joker") {
                        setJokerTempMap(prev => ({ ...prev, [id]: newType }));
                    }

                    setShufflingTileMap(prev => {
                        const updated = { ...prev };
                        delete updated[id];
                        return updated;
                    });
                }, 2000);
            },
            endTileShuffle: (id) => {
                setShufflingTileMap(prev => {
                    const next = { ...prev };
                    delete next[id];
                    return next;
                });
            },
            defaultEndTurn,
        });
    }, [players, currentTurn]);

    return (

        <div
            className="w-full h-screen relative overflow-hidden bg-[url('/resources/bg/gameBackground.png')] bg-repeat"
            style={{ backgroundSize: "1024px 1024px" }}
        >

            {currentPlayerTurnVisible && (
                <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <div className="bg-[rgba(0,0,0,0.7)] px-8 py-4 rounded shadow-lg text-white text-2xl font-bold animate-fade-in-out">
                        🎮 {players[currentTurn]?.nickname} 님의 턴입니다!
                    </div>
                </div>
            )}
            <div
                className="absolute"
                style={{
                    width: map?.width || "1600px",
                    height: map?.height || "900px",
                    transform: `translate(${-cameraPos.x + window.innerWidth / 2}px, ${-cameraPos.y + window.innerHeight / 2}px)`,
                    transition: "transform 0.8s ease-out",
                }}
            >

                {/* 타일 및 말 */}
                <TileMap tiles={tiles}
                    jokerTempMap={jokerTempMap}
                    questionTileMap={questionTileMap}
                    shufflingTileMap={shufflingTileMap} // ← 이 부분 반드시 필요 
                />
                {players.map((p) => (
                    <PlayerPiece key={p.id} tile={tiles.find((t) => t.id === p.position)} nickname={p.nickname} />
                ))}
            </div>

            <DicePanel onRoll={handleRollDice} diceValue={dice} currentPlayer={players[currentTurn]} disabled={isMoving || isWaitingDirection || awaitingTaxRoll || awaitingAbilityRoll || BattleManager._state.get()} />
            <BattleModal onBattleResolved={handleBattleEnd} />



            {awaitingTaxRoll && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg text-center">
                        <p className="mb-4 text-xl font-bold">세금 주사위를 굴려주세요!</p>
                        <button onClick={handleTaxRoll} className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded font-bold">🎲 주사위 굴리기</button>
                    </div>
                </div>
            )}

            {awaitingAbilityRoll && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg text-center">
                        <p className="mb-4 text-xl font-bold">{abilityRolls.length === 0 ? "첫 번째 주사위를 굴리세요!" : "두 번째 주사위를 굴리세요!"}</p>
                        <button onClick={handleAbilityDiceRoll} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded font-bold">🎲 주사위 굴리기</button>
                    </div>
                </div>
            )}

            {gameEnded && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="text-white text-4xl font-bold">🎊 게임 종료!</div>
                </div>
            )}

            {isWaitingDirection && availableDirections && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-50">
                    {Object.entries(availableDirections).map(([dir]) => (
                        <button key={dir} onClick={() => handleChooseDirection(dir)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow">
                            {dir}
                        </button>
                    ))}
                </div>
            )}

            {awaitingDOARoll && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg text-center">
                        <p className="mb-4 text-xl font-bold">DOA 주사위를 굴려주세요! (목표: {doaTarget})</p>
                        <button onClick={handleDOADiceRoll} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded font-bold">
                            🎲 DOA 굴리기
                        </button>
                    </div>
                </div>
            )}


        </div>
    );
}
