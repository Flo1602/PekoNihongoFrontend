import {AbstractLearnSessionStrategy, type LearnData, type LearnResult} from "@/components/learn/session/types.ts";
import {api} from "@/services/api/client.ts";
import type {LearnViewKey} from "@/components/learn/learnview/types.ts";
import type {Word} from "@/services/api/wordService.ts";
import {getRandomElements, nextInt} from "@/services/util/RandomUtils.ts";

export class WordSessionStrategy extends AbstractLearnSessionStrategy {
    readonly key = "words";
    readonly viewSequence: LearnViewKey[];

    private learningWords: Word[] | null = null;

    results: LearnResult[] = [];

    constructor() {
        super();

        this.viewSequence = [];

        const savedNoAudioExercises = localStorage.getItem("noAudioExercises");
        const audioExercisesDisabled =  savedNoAudioExercises !== null ? JSON.parse(savedNoAudioExercises) : false;

        let listening: boolean = false;
        for (let i = 0; i < 5; i++) {
            const listeningAvailable: boolean = !listening && i > 2 && !audioExercisesDisabled;
            switch (nextInt((listeningAvailable) ? 4 : 3)){
                case 0:
                    this.viewSequence = [...this.viewSequence, 'jteMatchR'];
                    break;
                case 1:
                case 2:
                    this.viewSequence = [...this.viewSequence, 'jteMatch'];
                    break;
                case 3:
                    this.viewSequence = [...this.viewSequence, 'ateMatch'];
                    listening = true;
                    break;
            }
        }
    }

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

    getResultsAndSave = (): number => {
        return super.getResultsAndSaveImpl("words");
    };

    setResults = (learnResult: LearnResult[]): void => {
        const filteredResult: LearnResult[] = [];
        learnResult.forEach(result => {
            if (!(filteredResult.find(r => r.id === result.id && !r.correct) && result.correct)) {
                filteredResult.push(result);
            }
        })

        this.results = [...this.results, ...filteredResult]
    }

    private fetchWords(): Promise<Word[]> {
        return api.get('/learning/words', {
            params: { count: 15 }
        }).then(res => res.data as Word[]);
    }
}