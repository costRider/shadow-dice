// src/hooks/useGameEngine.js
import { useState, useEffect, useCallback, useRef } from "react";
import { handleTileEffect, setTileEffectHandlers } from "@/components/game/tileEffects";
import BattleManager from "@/components/game/battle/BattleManager";
import { getRandomItem } from "@/components/game/utils/itemUtils";
import { fetchGameRoomData } from "@/services/gameService";

export default function useGameEngine(room) {
    const [tiles, setTiles] = useState([]);
    const [map, setMap] = useState(null);
    const [players, setPlayers] = useState(room?.players || []);
    //const [currentTurn, setCurrentTurn] = useState(0);
    const [cameraPos, setCameraPos] = useState({ x: 0, y: 0 });
    const [dice, setDice] = useState(null);
    const [isMoving, setIsMoving] = useState(false);
    const [isWaitingDirection, setIsWaitingDirection] = useState(false);
    const [availableDirections, setAvailableDirections] = useState(null);
    const [remainingSteps, setRemainingSteps] = useState(0);
    const [diceLimitMap, setDiceLimitMap] = useState({});
    const [gameEnded, setGameEnded] = useState(false);
    const [awaitingTaxRoll, setAwaitingTaxRoll] = useState(false);
    const [awaitingAbilityRoll, setAwaitingAbilityRoll] = useState(false);
    const [awaitingDOARoll, setAwaitingDOARoll] = useState(false);
    const [questionTileMap, setQuestionTileMap] = useState({});
    const [jokerTempMap, setJokerTempMap] = useState({});
    const [shufflingTileMap, setShufflingTileMap] = useState({});
    const [mapAttribute, setMapAttribute] = useState("NONE");
    const [pendingTaxPlayerId, setPendingTaxPlayerId] = useState(null);
    const [pendingAbilityPlayerId, setPendingAbilityPlayerId] = useState(null);
    const [abilityRolls, setAbilityRolls] = useState([]);
    const [doaTarget, setDoaTarget] = useState(null);
    const [currentTurnPlayerId, setCurrentTurnPlayerId] = useState(null);
    const taxEndTurnRef = useRef(null);
    const abilityEndTurnRef = useRef(null);
    const doaEndTurnRef = useRef(null);
    const savedTurnRef = useRef(null);
    const [prisonTurnMap, setPrisonTurnMap] = useState({});

    const getStartTileId = () => tiles.find(t => t.type === "START")?.id || 0;

    useEffect(() => {
        if (!room || !room.id) return;

        fetchGameRoomData(room.id)
            .then(({ room: fullRoom, players: loadedPlayers }) => {
                // ✅ selectedCharacters 등 필요한 필드를 파싱
                const parsedPlayers = loadedPlayers.map(p => ({
                    ...p,
                    selectedCharacters: typeof p.selectedCharacters === "string"
                        ? JSON.parse(p.selectedCharacters)
                        : p.selectedCharacters
                }));

                setPlayers(parsedPlayers); // 안정 정렬
                setCurrentTurnPlayerId(fullRoom.currentTurnPlayerId);
                const mapData = fullRoom.mapInfo;
                setMap(mapData);
                setTiles(mapData?.tiles || []);
                if (mapData?.tiles?.length > 0) {
                    setCameraPos({ x: mapData.tiles[0].x, y: mapData.tiles[0].y });
                }
            })
            .catch((err) => {
                console.error("게임 데이터 로딩 실패:", err);
            });
    }, [room?.id]);

    /*
        const defaultEndTurn = useCallback(() => {
            setIsMoving(false);
    
            setCurrentTurn(prev => {
                const next = (prev + 1) % players.length;
                const nextTile = tiles.find(t => t.id === players[next].position);
                if (nextTile) setCameraPos({ x: nextTile.x, y: nextTile.y });
                return next;
            });
    
        }, [players, tiles]);
    */
    const defaultEndTurn = useCallback(() => {
        setIsMoving(false);
        setCurrentTurnPlayerId(prev => {
            const currentIdx = players.findIndex(p => p.id === prev);
            const nextPlayer = players[(currentIdx + 1) % players.length];
            const nextTile = tiles.find(t => t.id === nextPlayer?.position);
            if (nextTile) setCameraPos({ x: nextTile.x, y: nextTile.y });
            return nextPlayer?.id;
        });
    }, [players, tiles]);



    const moveTo = async (id) => {
        const tile = tiles.find(t => t.id === id);
        if (!tile) return;
        setPlayers(prev => {
            const updated = [...prev];
            const index = updated.findIndex(p => p.id === currentTurnPlayerId);
            if (index === -1) return prev; // 예외 처리

            updated[index] = {
                ...updated[index],
                position: id,
                gp: (updated[index].gp || 0) + 1,
                movePath: [...(updated[index].movePath || []), id]
            };
            return updated;
        });
    };

    const handleMoveStep = async (steps, currentId, endTurnCallback = defaultEndTurn) => {
        const tile = tiles.find(t => t.id === currentId);
        if (!tile) return;

        const dirKeys = Object.keys(tile.directions || {});
        if (dirKeys.length > 1) {
            setIsWaitingDirection(true);
            setAvailableDirections(tile.directions);
            setRemainingSteps(steps);
            return;
        }
        const nextId = tile.directions[dirKeys[0]];
        await new Promise(r => setTimeout(r, 400));
        await moveTo(nextId);
        const nextStep = steps - 1;

        const player = players.find(p => p.id === currentTurnPlayerId);
        const nextTile = tiles.find(t => t.id === nextId);
        if (gameEnded) return;

        // 전투 체크
        if (nextTile?.type === "BATTLE") {
            const defender = players.find(p => p.id !== player.id && p.position === nextId);
            if (defender) {
                savedTurnRef.current = currentTurnPlayerId;
                // 전투 후
                setCurrentTurnPlayerId(savedTurnRef.current);
                await BattleManager.startBattle({
                    attacker: player,
                    defender,
                    onEnd: () => endTurnCallback(),
                    mapAttribute,
                });
                return;
            }
        }

        if (nextStep > 0) {
            setTimeout(() => handleMoveStep(nextStep, nextId, endTurnCallback), 400);
        } else {
            const result = await handleTileEffect(nextTile?.type, player, nextTile?.id, jokerTempMap);
            if (typeof result === "function") result(nextId, endTurnCallback, player);
            else endTurnCallback();
        }
    };

    const handleRollDice = () => {
        const player = players.find(p => p.id === currentTurnPlayerId);
        if (prisonTurnMap[player.id] > 0) {
            const roll1 = Math.floor(Math.random() * 6) + 1;
            const roll2 = Math.floor(Math.random() * 6) + 1;
            if (roll1 === roll2) {
                setPrisonTurnMap(prev => { const u = { ...prev }; delete u[player.id]; return u; });
            } else {
                setPrisonTurnMap(prev => ({ ...prev, [player.id]: prev[player.id] - 1 }));
                defaultEndTurn();
                return;
            }
        }

        const limit = diceLimitMap[player.id];
        let rolled = limit === "SPADE" ? Math.floor(Math.random() * 3) + 1 :
            limit === "CLOVER" ? Math.floor(Math.random() * 3) + 4 :
                Math.floor(Math.random() * 6) + 1;

        if (player.chessmanType === "DISK" && mapAttribute === "DISK") rolled += 2;
        if (player.chessmanType === "DISK" && mapAttribute === "WAND") rolled -= 2;

        setDiceLimitMap(prev => { const p = { ...prev }; delete p[player.id]; return p; });
        setDice(rolled);
        setIsMoving(true);
        setRemainingSteps(rolled);
        handleMoveStep(rolled, player.position);
    };

    const handleChooseDirection = async (dir) => {
        const tile = tiles.find(t => t.id === players.find(p => p.id === currentTurnPlayerId).position);
        const nextId = tile.directions[dir];
        setIsWaitingDirection(false);
        setAvailableDirections(null);
        await new Promise(r => setTimeout(r, 400));
        await moveTo(nextId);
        const nextStep = remainingSteps - 1;
        setRemainingSteps(nextStep);
        if (nextStep > 0) setTimeout(() => handleMoveStep(nextStep, nextId), 400);
        else {
            const player = players.find(p => p.id === currentTurnPlayerId);
            const result = await handleTileEffect(tiles.find(t => t.id === nextId).type, player, nextId, jokerTempMap);
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
            setPlayers(updatedPlayers);
            setAwaitingAbilityRoll(false);
            setPendingAbilityPlayerId(null);
            setAbilityRolls([]);
            abilityEndTurnRef.current?.();
            abilityEndTurnRef.current = null;
        }
    };

    const handleDOADiceRoll = () => {
        const rolled = Math.floor(Math.random() * 6) + 1;
        const diff = Math.abs(doaTarget - rolled);
        if (diff === 0) doaEndTurnRef.current?.();
        else if (diff <= 2) handleMoveStep(diff * -2, players.find(p => p.id === currentTurnPlayerId).position, doaEndTurnRef.current);
        else moveTo(getStartTileId()).then(() => doaEndTurnRef.current?.());
        setAwaitingDOARoll(false);
        setDoaTarget(null);
    };

    useEffect(() => {
        if (tiles.length === 0 || players.length === 0) return;
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
    }, [tiles]);

    useEffect(() => {
        setTileEffectHandlers({
            setMapAttribute,
            forceMoveHandler: (steps, from, cb) => setTimeout(() => handleMoveStep(steps, from, cb), 400),
            setDiceLimitMap,
            onGameEnd: () => setGameEnded(true),
            awaitTaxRoll: (playerId, cb) => { setPendingTaxPlayerId(playerId); setAwaitingTaxRoll(true); taxEndTurnRef.current = cb; },
            awaitAbilityRoll: (playerId, cb) => { setPendingAbilityPlayerId(playerId); setAwaitingAbilityRoll(true); abilityEndTurnRef.current = cb; },
            awaitDOARoll: (playerId, target, cb) => { setAwaitingDOARoll(true); setDoaTarget(target); doaEndTurnRef.current = cb; },
            moveTo,
            getTiles: () => tiles,
            updateQuestionTileMap: (tid, val) => setQuestionTileMap(prev => ({ ...prev, [tid]: val })),
            updateJokerTempType: (tid, val) => setJokerTempMap(prev => ({ ...prev, [tid]: val })),
            revertJokerTile: (tid) => setJokerTempMap(prev => { const u = { ...prev }; delete u[tid]; return u; }),
            startTileShuffle: (id, newType, from) => {
                setShufflingTileMap(prev => ({ ...prev, [id]: true }));
                setTimeout(() => {
                    if (from === "question") setQuestionTileMap(prev => ({ ...prev, [id]: newType }));
                    if (from === "joker") setJokerTempMap(prev => ({ ...prev, [id]: newType }));
                    setShufflingTileMap(prev => { const u = { ...prev }; delete u[id]; return u; });
                }, 2000);
            },
            endTileShuffle: (id) => setShufflingTileMap(prev => { const u = { ...prev }; delete u[id]; return u; }),
            defaultEndTurn,
        });
    }, [players, currentTurnPlayerId]);

    return {
        tiles, map, players, cameraPos, dice, isMoving,
        isWaitingDirection, availableDirections, mapAttribute,
        handleRollDice, handleChooseDirection, currentTurnPlayerId,
        awaitingTaxRoll, handleTaxRoll,
        awaitingAbilityRoll, handleAbilityDiceRoll,
        awaitingDOARoll, handleDOADiceRoll,
        gameEnded, questionTileMap, jokerTempMap, shufflingTileMap
    };
}
