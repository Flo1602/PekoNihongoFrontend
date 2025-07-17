import {useContext, useEffect, useState} from 'react'
import type {MatchItem} from "@/components/learn/learnview/match/types.ts";
import {LearnDataContext} from "@/contexts/LearnDataContext.tsx";
import type {Word} from "@/services/api/wordService.ts";
import MatchView from "@/components/learn/learnview/match/MatchView.tsx";

const JapaneseToKanaMatch = () => {
    const [ matchItems, setMatchItems] = useState<MatchItem<string, string>[]>([]);
    const learnDataContext = useContext(LearnDataContext);

    useEffect(() => {
        if (!learnDataContext?.words) return;
        setMatchItems(learnDataContext.words.map<MatchItem<string, string>>((word: Word) => ({
            id: word.id,
            question: word.japanese,
            answer: word.kana,
            questionAudio: word.ttsPath,
            answerAudio: ''
        })));
    }, [learnDataContext])

    return (
        <MatchView matchItems={matchItems}/>
    )
}
export default JapaneseToKanaMatch
