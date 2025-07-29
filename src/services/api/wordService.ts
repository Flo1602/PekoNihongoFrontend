import {api} from "@/services/api/client.ts";

export interface Word{
    id: number,
    japanese: string,
    english: string,
    kana: string,
    ttsPath: string
}

export interface WordPage{
    content:Word[],
    pageCount: number
}

export interface WordPageRequest{
    page: number,
    size: number,
    search?: string
}

export async function getWordPage(request: WordPageRequest) {
    return api.get('/words', {
        params: {
            pageSize: request.size,
            page: request.page,
            search: request.search
        }
    });
}

export async function addWord(word: Word) {
    return api.post('/words', word);
}

export async function updateWord(word: Word) {
    return api.put('/words', word);
}

export async function deleteWord(id: number) {
    return api.delete(`/words/${id}`);
}