import {api} from "@/services/api/client.ts";

export interface Settings{
    voiceId: number,
    maxDailyWords: number,
    maxDailyKanji: number
}

export async function getSettings() {
    return api.get('/settings');
}

export async function updateSettings(settings: Settings) {
    return api.put('/settings', settings);
}