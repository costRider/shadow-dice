// src/hooks/useShop.js
import { useState, useEffect, useCallback } from 'react';
import * as shopService from '@/services/shopService';

export function useShopItems(category) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const data = await shopService.getShopItems(category);
            setItems(data);
            setError(null);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [category]);

    useEffect(() => { fetchItems(); }, [fetchItems]);
    return { items, loading, error, refetch: fetchItems };
}

export function usePurchase() {
    const [loading, setLoading] = useState(false);

    const purchase = async (itemId) => {
        setLoading(true);
        try {
            await shopService.purchaseItem(itemId);
            return { success: true };
        } catch (err) {
            let message = err.message;
            if (message === 'Insufficient GP') {
                message = '⚠️ GP가 부족합니다.';
            }
            return { success: false, message };
        } finally {
            setLoading(false);
        }
    };

    return { purchase, loading };
}