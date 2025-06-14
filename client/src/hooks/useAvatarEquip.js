// src/hooks/useAvatarEquip.js
import { useState, useEffect, useCallback } from 'react';
import * as avatarEquipService from '@/services/avatarEquipService';

export function useAvatarEquips() {
    const { inventory, loading: inventoryLoading, error: inventoryError, refetch: fetchInventory } = useAvatarInventory();
    const { equipped: equips, loading: equipLoading, error: equipError, refetch: fetchEquips } = useEquippedAvatars();
    const { equip, unequip, loading: actionLoading } = useAvatarEquipActions();
    useEffect(() => {
        console.log("🎯 equips 값 확인:", equips);
    }, [equips]);

    return {
        inventory,
        equips,
        equip,
        unequip,
        fetchInventory,
        fetchEquips,
        loading: inventoryLoading || equipLoading || actionLoading,
        error: inventoryError || equipError,
    };
}

export function useAvatarInventory() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchInventory = useCallback(async () => {
        setLoading(true);
        try {
            const data = await avatarEquipService.getAvatarInventory();
            setInventory(data);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchInventory(); }, [fetchInventory]);

    return { inventory, loading, error, refetch: fetchInventory };
}

export function useEquippedAvatars() {
    const [equipped, setEquipped] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchEquipped = useCallback(async () => {
        setLoading(true);
        try {
            const data = await avatarEquipService.getEquippedAvatars();
            setEquipped(data);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchEquipped(); }, [fetchEquipped]);

    return { equipped, loading, error, refetch: fetchEquipped };
}

export function useAvatarEquipActions() {
    const [loading, setLoading] = useState(false);
    const equip = async (partCode, itemId) => {
        setLoading(true);
        try {
            await avatarEquipService.equipAvatar(partCode, String(itemId));
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    };

    const unequip = async (partCode) => {
        setLoading(true);
        try {
            await avatarEquipService.unequipAvatar(partCode);
            return { success: true };
        } catch (err) {
            return { success: false, message: err.message };
        } finally {
            setLoading(false);
        }
    };

    return { equip, unequip, loading };
}
