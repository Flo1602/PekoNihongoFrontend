import type {LearnViewKey} from "@/components/learn/learnview/types.ts";
import type {Word} from "@/services/api/wordService.ts";
import type {Kanji} from "@/services/api/kanjiService.ts";
import {api} from "@/services/api/client.ts";

export interface LearnSessionStrategy {
    readonly key: string;
    readonly viewSequence: LearnViewKey[];
    getLearnData: () => Promise<LearnData>;
    getResultsAndSave: () => number;
}

export interface LearnData {
    currentLearnView?: LearnViewKey;
    words?: Word[];
    kanji?: Kanji;
    extraData?: string[];
    setResults: (results: LearnResult[]) => void;
    refresh?: boolean;
}

export interface LearnResult {
    id: number
    correct: boolean;
}

export abstract class AbstractLearnSessionStrategy implements LearnSessionStrategy {
    abstract readonly key: string;
    abstract readonly viewSequence: LearnViewKey[];

    abstract results: LearnResult[];

    abstract getLearnData(): Promise<LearnData>;

    private saveLearningData(type: string): void {
        api.post('/learning/' + type, this.results);
    }

    abstract getResultsAndSave: () => number;

    protected getResultsAndSaveImpl (type: string): number {
        let countCorrect: number = 0;
        this.results.forEach(result => {
            if(result.correct) {
                countCorrect++;
            }
        })

        this.saveLearningData(type);

        return 100 / this.results.length * countCorrect;
    };
}