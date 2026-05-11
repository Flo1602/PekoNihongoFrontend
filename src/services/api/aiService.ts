import {api} from "@/services/api/client.ts";
import type {Word} from "@/services/api/wordService.ts";

export async function enhanceWordEntry(word: Word) {
    return api.put('/ai/enhanceWordEntry', word);
}