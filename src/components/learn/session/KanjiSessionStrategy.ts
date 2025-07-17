import {AbstractLearnSessionStrategy, type LearnData, type LearnResult} from "@/components/learn/session/types.ts";
import type {LearnViewKey} from "@/components/learn/learnview/types.ts";

export class KanjiSessionStrategy extends AbstractLearnSessionStrategy {
    readonly key = "words";
    readonly viewSequence: LearnViewKey[];

    //private learningWords: Word[] | null = null;

    //private results: LearnResult[] = [];

    constructor() {
        super();

        this.viewSequence = ['kanjiDraw'];


    }

    getLearnData = async(): Promise<LearnData> => {


        return {
            kanji: { id: 5, symbol: '遊'},
            setResults: this.setResults
        };
    };

    getResultsAndSave = (): number => {
        return 0;
    };

    setResults = (learnResult: LearnResult[]): void => {
        console.log(learnResult);
    }
}