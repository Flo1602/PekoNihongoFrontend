import {api} from "@/services/api/client.ts";

export interface KanjiWords{
    id: number,
    symbol: string,
    words: string[]
}

export interface Kanji{
    id: number,
    symbol: string
}

export interface KanjiPage{
    content:KanjiWords[],
    pageCount: number
}

export interface KanjiPageRequest{
    page: number,
    size: number
}

export async function getKanjiPage(request: KanjiPageRequest) {
    return api.get('/kanji', {
        params: {
            pageSize: request.size,
            page: request.page
        }
    });
}

export async function deleteKanji(id: number) {
    return api.delete(`/kanji/${id}`);
}