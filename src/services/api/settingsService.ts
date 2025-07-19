import {api} from "@/services/api/client.ts";

export interface SettingsType{
    voiceId: number,
    maxDailyWords: number,
    maxDailyKanji: number,
    useAlwaysVoiceVox: boolean
}

export async function getSettings() {
    return api.get('/settings');
}

export async function updateSettings(settings: SettingsType) {
    return api.put('/settings', settings);
}