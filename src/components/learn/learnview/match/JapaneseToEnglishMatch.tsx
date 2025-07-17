import MatchView from "@/components/learn/learnview/match/MatchView.tsx";
import {useContext, useEffect, useState} from "react";
import type {MatchItem} from "@/components/learn/learnview/match/types.ts";
import {LearnDataContext} from "@/contexts/LearnDataContext.tsx";
import type {Word} from "@/services/api/wordService.ts";

interface Props{
    reverse?: boolean;
}
const JapaneseToEnglishMatch = (probs: Props) => {

    const [ matchItems, setMatchItems] = useState<MatchItem<string, string>[]>([]);
    const learnDataContext = useContext(LearnDataContext);

    useEffect(() => {
        if (!learnDataContext?.words) return;
        setMatchItems(learnDataContext.words.map<MatchItem<string, string>>((word: Word) => ({
            id: word.id,
            question: (probs.reverse) ? word.english : word.japanese,
            answer: (probs.reverse) ? word.japanese : word.english,
            questionAudio: (probs.reverse) ? "" : word.ttsPath,
            answerAudio: (probs.reverse) ? word.ttsPath : "",
        })));
    }, [learnDataContext])

    return (
        <MatchView matchItems={matchItems}/>
    )
}
export default JapaneseToEnglishMatch
