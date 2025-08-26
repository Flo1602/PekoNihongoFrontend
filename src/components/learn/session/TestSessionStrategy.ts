import {AbstractLearnSessionStrategy, type LearnData, type LearnResult} from "@/components/learn/session/types.ts";
import type {LearnViewKey} from "@/components/learn/learnview/types.ts";
import {getRandomElements} from "@/services/util/RandomUtils.ts";
import type {Word} from "@/services/api/wordService.ts";
import {api} from "@/services/api/client.ts";

export class TestSessionStrategy extends AbstractLearnSessionStrategy {
    readonly key = "test";
    readonly viewSequence: LearnViewKey[];
    results: LearnResult[] = [];

    private learningWords: Word[] | null = null;

    constructor() {
        super();
        this.viewSequence = ["wordSpeaking", "wordSpeaking", "wordSpeaking"];
    }

    getResultsAndSave = (): number => {
        let correctCount = 0;
        this.results.forEach(result => {
            if(result.correct) {
                correctCount++;

            }
        })

        return correctCount / this.results.length * 100;
    };


    getLearnData = async(): Promise<LearnData> => {
        if (!this.learningWords || this.learningWords.length === 0) {
            this.learningWords = await this.fetchWords();
        }

        const unlearnedWords = this.learningWords.filter(word => !this.results.find(result => result.id === word.id));
        let randomElements = getRandomElements<Word>(unlearnedWords, 5);

        if (randomElements.length < 5) {
            const chosenIds = new Set(randomElements.map(w => w.id));
            const fillCount = 5 - randomElements.length;

            const fillerPool = this.learningWords.filter(
                word => !chosenIds.has(word.id)
            );

            const filler = getRandomElements<Word>(fillerPool, fillCount);

            randomElements = [...randomElements, ...filler];
        }

        return {
            words: randomElements!,
            setResults: this.setResults
        };
    };

    setResults = (learnResult: LearnResult[]): void => {
        this.results.push(...learnResult);
    }

    private fetchWords(): Promise<Word[]> {
        return api.get('/learning/words/random', {
            params: { count: 15 }
        }).then(res => res.data as Word[]);
    }

}