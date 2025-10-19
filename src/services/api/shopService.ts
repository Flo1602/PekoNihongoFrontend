import {api} from "@/services/api/client.ts";

export interface ShopItem {
    type: ShopItemType;
    price: number;
    available: boolean;
}

export const SHOP_ITEM_TYPES = ['STREAK_EXTENDER', 'MONEY_GAMBLE', 'MONEY_GAMBLE_HIGH_RISK', 'CHALLENGE_QUEST'] as const;
export type ShopItemType = typeof SHOP_ITEM_TYPES[number];

export async function getAllItems() {
    return api.get('/shop');
}

export async function buyItem(type: ShopItemType) {
    return api.post('/shop/buy', type);
}

export async function gamble(type: ShopItemType, amount: number) {
    return api.post(`/shop/gamble/${amount}`, type);
}

export async function getCurrMoney() {
    return api.get('/shop/currMoney');
}