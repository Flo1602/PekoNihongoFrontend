import type {MatchItem} from "@/components/learn/learnview/match/types.ts";
import * as React from "react";
import {shuffle} from "@/services/util/arrayUtils.ts";
import {useContext, useEffect, useRef} from "react";
import MatchButton from "@/components/learn/learnview/match/MatchButton.tsx";
import {LearnManagerContext} from "@/contexts/LearnManagerContext.tsx";
import {LearnDataContext} from "@/contexts/LearnDataContext.tsx";
import type {LearnResult} from "@/components/learn/session/types.ts";

interface Props<Q extends React.ReactNode, A extends React.ReactNode> {
    matchItems: MatchItem<Q, A>[];
}

interface Question<Q extends React.ReactNode> {
    id: number;
    question: Q;
    ttsPath: string;
}

interface Answer<A extends React.ReactNode> {
    id: number;
    answer: A;
    ttsPath: string;
}

const MAX_ERRORS = 2;

const MatchView = <Q extends React.ReactNode, A extends React.ReactNode>({matchItems}: Props<Q, A>) => {

    const questions = React.useMemo<Question<Q>[]>(
        () =>
            shuffle(matchItems.map((m, index) => ({
                id: index,
                question: m.question,
                ttsPath: m.questionAudio
            }))),
        [matchItems]
    );
    const answers = React.useMemo<Answer<A>[]>(
        () =>
            shuffle(matchItems.map((m, index) => ({
                id: index,
                answer: m.answer,
                ttsPath: m.answerAudio
            }))),
        [matchItems]
    );

    const [selectedQuestionId, setSelectedQuestionId] = React.useState<number | null>(null);
    const [selectedAnswerId, setSelectedAnswerId] = React.useState<number | null>(null);
    const [finishedIds, setFinishedIds] = React.useState<number[]>([]);
    const [correctIds, setCorrectIds] = React.useState<number[]>([]);
    const [wrongIds, setWrongIds] = React.useState<number[]>([]);
    const result = useRef<LearnResult[]>([])

    const learnManagerContext = useContext(LearnManagerContext);
    const learnDataContext = useContext(LearnDataContext);

    useEffect(() => {
        if (selectedQuestionId !== null && selectedAnswerId !== null) {
            if (selectedQuestionId === selectedAnswerId) {
                setCorrectIds([selectedQuestionId, selectedAnswerId]);
                setSelectedQuestionId(null);
                setSelectedAnswerId(null);
                setFinishedIds(prev => [...prev, selectedQuestionId]);
                result.current.push({ id: matchItems[selectedQuestionId].id, correct: true})
                setTimeout(() => {
                    setCorrectIds([]);
                }, 350);
            } else {
                setWrongIds([selectedQuestionId, selectedAnswerId]);
                setSelectedQuestionId(null);
                setSelectedAnswerId(null);
                result.current.push({ id: matchItems[selectedQuestionId].id, correct: false})

                const errorCount = result.current.filter(res => !res.correct).length;
                if (errorCount > MAX_ERRORS) {
                    completed(false);
                }

                setTimeout(() => {
                    setWrongIds([]);
                }, 500);
            }
        }
    }, [selectedQuestionId, selectedAnswerId]);

    useEffect(() => {
        if(finishedIds.length === matchItems.length && finishedIds.length !== 0){
            completed(true);
        }
    }, [finishedIds, matchItems.length]);

    useEffect(() => {
        setFinishedIds([]);
    }, [questions]);

    const completed = (correct: boolean): void =>{
        for(let i = 0; i < matchItems.length; i++){
            if(!finishedIds.includes(i)){
                finishedIds.push(i);
            }
        }
        learnDataContext?.setResults(result.current);
        result.current = [];
        learnManagerContext?.onComplete(correct);
    }

    const handleQuestionClick = (id: number) => {
        setSelectedQuestionId(prev => prev === id ? null : id);
    }
    const handleAnswerClick = (id: number) => {
        setSelectedAnswerId(prev => prev === id ? null : id);
    }

    return (
        <div className="flex flex-1 w-full items-center justify-center bg-base-300">
            <div className="w-full max-w-screen-md md:max-w-screen-lg lg:max-w-screen-xl px-2 sm:px-4 lg:px-8">
                <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:gap-16">
                    <div className="flex flex-col gap-3 sm:gap-4">
                        {questions.map(q => (
                            <MatchButton
                                key={q.id}
                                id={q.id}
                                onClick={() => handleQuestionClick(q.id)}
                                disabled={finishedIds.includes(q.id)}
                                isCorrect={correctIds[0] === q.id}
                                isWrong={wrongIds[0] === q.id}
                                isSelected={selectedQuestionId === q.id}
                                ttsPath={q.ttsPath}
                            >
                                {q.question}
                            </MatchButton>
                        ))}
                    </div>

                    <div className="flex flex-col gap-3 sm:gap-4">
                        {answers.map(a => (
                            <MatchButton
                                key={a.id}
                                id={a.id}
                                onClick={() => handleAnswerClick(a.id)}
                                disabled={finishedIds.includes(a.id)}
                                isCorrect={correctIds[1] === a.id}
                                isWrong={wrongIds[1] === a.id}
                                isSelected={selectedAnswerId === a.id}
                                ttsPath={a.ttsPath}
                            >
                                {a.answer}
                            </MatchButton>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
export default MatchView
