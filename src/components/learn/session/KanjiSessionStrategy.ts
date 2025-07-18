import {AbstractLearnSessionStrategy, type LearnData, type LearnResult} from "@/components/learn/session/types.ts";
import type {LearnViewKey} from "@/components/learn/learnview/types.ts";
import type {Word} from "@/services/api/wordService.ts";
import {api} from "@/services/api/client.ts";
import {extractKanji} from "@/services/util/KanjiUtil.tsx";
import {nextInt} from "@/services/util/RandomUtils.ts";

export class KanjiSessionStrategy extends AbstractLearnSessionStrategy {
    private readonly EASY_CAP = 3;
    private readonly MEDIUM_CAP = 6;

    readonly key = "words";
    viewSequence: LearnViewKey[] = [];

    private kanji: KanjiLearningDto | null = null;
    private randomWordsIndex: number = 0;
    private randomKanji: string[] = [];
    private difficulty: 'easy' | 'medium' | 'hard' = 'easy';

    results: LearnResult[] = [];

    constructor() {
        super();
        this.viewSequence = ['wordKanjiSelect', 'kanjiDraw'];
    }

    getLearnData = async(): Promise<LearnData> => {
        if (!this.kanji) {
            this.kanji = await this.fetchWords();

            this.kanji.randomWords.forEach(word => {
                this.randomKanji.push(...extractKanji(word.japanese));
            })

            this.calcDifficulty();
            this.setViewSequence();

            console.log(this.difficulty);
            console.log(this.viewSequence);
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

    private calcDifficulty(): void {
        const learnedDays = this.kanji?.learnedDays ?? 0;

        if (learnedDays < this.EASY_CAP) {
            this.difficulty = 'easy';
        } else if (learnedDays < this.MEDIUM_CAP) {
            this.difficulty = 'medium';
        } else {
            this.difficulty = 'hard';
        }
    }

    private setViewSequence(): void {
        switch (this.difficulty) {
            case 'easy':
                this.viewSequence = [...this.viewSequence, 'kanjiDraw'];
                this.lowDifficulty();
                break;
            case 'medium':
                this.mediumDifficulty();
                break;
            case 'hard':
                this.highDifficulty();
                break;
        }

        this.viewSequence = [...this.viewSequence, 'kanjiDraw', 'kanjiDraw']
    }

    private lowDifficulty(): void {
        for (let i = 0; i < 3; i++) {
            const rand = nextInt(5);

            switch (rand) {
                case 0:
                case 1:
                case 2:
                    this.viewSequence = [...this.viewSequence, 'kanjiDraw'];
                    break;
                case 3:
                case 4:
                    this.viewSequence = [...this.viewSequence, 'jtkMatch'];
            }
        }
    }

    private mediumDifficulty(): void {
        for (let i = 0; i < 3; i++) {
            const rand = nextInt(5);

            switch (rand) {
                case 0:
                case 1:
                    this.viewSequence = [...this.viewSequence, 'kanjiDraw'];
                    break;
                case 2:
                case 3:
                case 4:
                    this.viewSequence = [...this.viewSequence, 'jtkMatch'];
            }
        }
    }

    private highDifficulty(): void {
        for (let i = 0; i < 2; i++) {
            const rand = nextInt(6);

            switch (rand) {
                case 0:
                case 1:
                case 2:
                    this.viewSequence = [...this.viewSequence, 'kanjiDraw'];
                    break;
                case 3:
                case 4:
                case 5:
                    this.viewSequence = [...this.viewSequence, 'jtkMatch'];
            }
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
    learnedDays: number;
}