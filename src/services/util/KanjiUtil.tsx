export function extractKanji(text: string): string[] {
    const matches = text.match(/\p{Script=Han}/gu);
    return matches ?? [];
}

export function replaceKanjiWithRandom(text: string, kanjiList: string[]): string {
    if (kanjiList.length === 0) {
        throw new Error("kanjiList must contain at least one Kanji character.");
    }

    // Replace each Kanji in the text
    return text.replace(/\p{Script=Han}/gu, () => {
        const idx = Math.floor(Math.random() * kanjiList.length);
        return kanjiList[idx];
    });
}