import {api} from "@/services/api/client.ts";
import type {Word, WordPageRequest} from "@/services/api/wordService.ts";

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

export async function quickAddSearch(search: string) {
    return api.get(`/words/drafts/search`, {
        params: {
            search: search,
        }}
    );
}