import {api} from "@/services/api/client.ts";
import type {Word, WordPageRequest} from "@/services/api/wordService.ts";

export interface WordInfo{
    word: string,
    link: string,
    jlptInfo: string,
    kanjiInfos: KanjiInfo[]
}

export interface KanjiInfo{
    symbol: string,
    jlptInfo: string,
    learned: boolean
}

export async function getWordDraftPage(request: WordPageRequest) {
    return api.get('/words/drafts', {
        params: {
            pageSize: request.size,
            page: request.page
        }
    });
}

export async function addWordDraft(word: Word) {
    return api.post('/words/drafts', word);
}

export async function updateWordDraft(word: Word) {
    return api.put('/words/drafts', word);
}

export async function deleteWordDraft(id: number) {
    return api.delete(`/words/drafts/${id}`);
}

export async function setActiveVocab(id: number) {
    return api.post(`/words/drafts/${id}/activate`);
}

export async function quickAddSearch(search: string, convertToKana: boolean) {
    return api.get(`/words/drafts/search`, {
        params: {
            search: search,
            convertToKana: convertToKana
        }}
    );
}

export async function getWordInfo(id: number) {
    return api.get(`/words/drafts/${id}/info`);
}