// src/services/shopService.js
import apiClient from './apiClient';

export async function getShopItems(category) {
    const { ok, data, error } = await apiClient.get(`shop/items?category=${category}`);
    if (!ok) throw new Error(error || 'Shop items fetch failed');

    // metadata 가 문자열이면 JSON.parse, 아니면 그대로
    return data.map(item => ({
        ...item,
        metadata: typeof item.metadata === 'string'
            ? JSON.parse(item.metadata)
            : item.metadata
    }));
}

export async function purchaseItem(itemId) {
    const { ok, data } = await apiClient.post('shop/purchase', { itemId });
    if (!ok) throw new Error(data?.error || 'Purchase failed');
    return true;
}