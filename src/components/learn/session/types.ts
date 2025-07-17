import type {LearnViewKey} from "@/components/learn/learnview/types.ts";
import type {Word} from "@/services/api/wordService.ts";
import type {Kanji} from "@/services/api/kanjiService.ts";

export interface LearnSessionStrategy {
    readonly key: string;
    readonly viewSequence: LearnViewKey[];
    getLearnData: () => Promise<LearnData>;
    getResultsAndSave: () => number;
}

export interface LearnData {
    words?: Word[];
    kanji?: Kanji;
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

    abstract getLearnData(): Promise<LearnData>;

    abstract getResultsAndSave: () => number;
}