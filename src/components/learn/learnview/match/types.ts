export interface MatchItem<Q, A> {
    id: number;
    question: Q;
    questionAudio: string;
    answer: A;
    answerAudio: string;
}