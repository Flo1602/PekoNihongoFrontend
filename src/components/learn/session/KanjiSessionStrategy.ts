import {AbstractLearnSessionStrategy, type LearnData, type LearnResult} from "@/components/learn/session/types.ts";
import type {LearnViewKey} from "@/components/learn/learnview/types.ts";
import type {Word} from "@/services/api/wordService.ts";
import {api} from "@/services/api/client.ts";

export class KanjiSessionStrategy extends AbstractLearnSessionStrategy {
    readonly key = "words";
    readonly viewSequence: LearnViewKey[];

    private kanji: KanjiLearningDto | null = null;
    private randomWordsIndex: number = 0;

    results: LearnResult[] = [];

    constructor() {
        super();

        this.viewSequence = ['kanjiDraw'];
    }

    getLearnData = async(): Promise<LearnData> => {
        if (!this.kanji) {
            this.kanji = await this.fetchWords();
        }

        const words = this.kanji.kanjiWords;
        let counter = 0;

        while (counter < 5) {
            words.push(this.kanji.randomWords[this.randomWordsIndex]);
            this.randomWordsIndex++;
            counter++;
            if (this.randomWordsIndex >= this.kanji.randomWords.length) {
                this.randomWordsIndex = 0;
            }
        }

        return {
            kanji: { id: this.kanji.id, symbol: this.kanji.symbol},
            words: words,
            setResults: this.setResults
        };
    };

    getResultsAndSave = (): number => {
        return super.getResultsAndSaveImpl("kanji");
    };

    setResults = (learnResult: LearnResult[]): void => {
        this.results.push(...learnResult);
    }

    private fetchWords(): Promise<KanjiLearningDto> {
        return api.get('/learning/kanji', {
            params: { wordCount: 20 }
        }).then(res => res.data as KanjiLearningDto);
    }
}

export interface KanjiLearningDto{
    id: number;
    symbol: string;
    kanjiWords: Word[];
    randomWords: Word[];
}