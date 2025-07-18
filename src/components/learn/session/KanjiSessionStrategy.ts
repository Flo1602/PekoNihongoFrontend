import {AbstractLearnSessionStrategy, type LearnData, type LearnResult} from "@/components/learn/session/types.ts";
import type {LearnViewKey} from "@/components/learn/learnview/types.ts";
import type {Word} from "@/services/api/wordService.ts";
import {api} from "@/services/api/client.ts";
import {extractKanji} from "@/services/util/KanjiUtil.tsx";

export class KanjiSessionStrategy extends AbstractLearnSessionStrategy {
    readonly key = "words";
    readonly viewSequence: LearnViewKey[];

    private kanji: KanjiLearningDto | null = null;
    private randomWordsIndex: number = 0;
    private randomKanji: string[] = [];

    results: LearnResult[] = [];

    constructor() {
        super();
        this.viewSequence = ['wordKanjiSelect', "jtkMatch"];
    }

    getLearnData = async(): Promise<LearnData> => {
        if (!this.kanji) {
            this.kanji = await this.fetchWords();

            this.kanji.randomWords.forEach(word => {
                this.randomKanji.push(...extractKanji(word.japanese));
            })
        }

        const words = [...this.kanji.kanjiWords];
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
            extraData: this.randomKanji,
            setResults: this.setResults
        };
    };

    getResultsAndSave = (): number => {
        return super.getResultsAndSaveImpl("kanji");
    };

    setResults = (learnResult: LearnResult[]): void => {
        if(this.kanji != null && learnResult.length > 1){
            let counter = 0;
            learnResult.forEach(result => {
                counter += result.correct ? 1 : 0;
            })
            if(100/learnResult.length*counter > 50){
                this.results.push({id: this.kanji.id, correct: true});
            } else {
                this.results.push({id: this.kanji.id, correct: false});
            }
        } else {
            this.results.push(...learnResult);
        }
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