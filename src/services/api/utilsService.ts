import {api} from "@/services/api/client.ts";

export async function getJapaneseSimilarity(word: string, wordKana: string) {
    return api.get('/utils/japaneseSimilarity', {
        params: {
            word: word,
            wordKana: wordKana
        }
    });
}