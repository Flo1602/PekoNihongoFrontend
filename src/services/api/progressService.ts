import {api} from "@/services/api/client.ts";

export interface ProgressData {
    dueToday: number;
    completedToday: number;
    totalPending: number;
}

export async function getWordProgress() {
    return api.get('learning/words/progress');
}

export async function getKanjiProgress() {
    return api.get('learning/kanji/progress');
}