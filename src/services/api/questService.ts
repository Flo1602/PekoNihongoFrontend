import {api} from "@/services/api/client.ts";

export const QuestTypes = ['CUSTOM', 'DAILY_WORDS', 'DAILY_KANJI', 'NEW_DRAFTS'] as const;
export type QuestType = typeof QuestTypes[number];

export type QuestCategory = 'DAILY_QUEST';

export interface Quest {
    id: number;
    type: QuestType;
    category: QuestCategory;
    text: string;
    goal: number;
    progress: number;
}

export async function getDailyQuests() {
    return api.get('/quests/daily');
}

export async function createDailyQuest(quest: Quest) {
    return api.post('/quests', quest);
}

export async function deleteQuest(id: number) {
    return api.delete(`/quests/${id}`);
}

export async function updateQuest(quest: Quest) {
    return api.put('/quests', quest);
}

