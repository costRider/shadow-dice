// src/services/avatarEquipService.js
import apiClient from './apiClient';

export async function getAvatarInventory() {
    const { ok, data, error } = await apiClient.get('user-avatar/inventory');
    if (!ok) throw new Error(error || 'Failed to load avatar inventory');
    return data;
}

export async function getEquippedAvatars() {
    const { ok, data, error } = await apiClient.get('user-avatar/equipped');
    if (!ok) throw new Error(error || 'Failed to load equipped avatars');
    return data;
}

export async function equipAvatar(partCode, itemId) {
    const { ok, data, error } = await apiClient.post('user-avatar/equip', { partCode, itemId });
    if (!ok) throw new Error(error || 'Equip failed');
    return true;
}

export async function unequipAvatar(partCode) {
    const { ok, data, error } = await apiClient.post('user-avatar/unequip', { partCode });
    if (!ok) throw new Error(error || 'Unequip failed');
    return true;
}
