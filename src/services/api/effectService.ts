import {api} from "@/services/api/client.ts";

export const EFFECT_TYPES = ['ALLOW_DAILY_QUESTS_EDIT'] as const;
export type EffectType = typeof EFFECT_TYPES[number];

export async function isEffectActive(type: EffectType) {
    return api.get(`/effects/isActive/${type}`);
}