import MatchView from "@/components/learn/learnview/match/MatchView.tsx";
import {useContext, useEffect, useState} from "react";
import type {MatchItem} from "@/components/learn/learnview/match/types.ts";
import {LearnDataContext} from "@/contexts/LearnDataContext.tsx";
import type {Word} from "@/services/api/wordService.ts";

interface Props{
    reverse?: boolean;
}
const JapaneseToEnglishMatch = (props: Props) => {

    const [ matchItems, setMatchItems] = useState<MatchItem<string, string>[]>([]);
    const learnDataContext = useContext(LearnDataContext);

    useEffect(() => {
        if (!learnDataContext?.words) return;
        if(learnDataContext.currentLearnView !== "jteMatch" && learnDataContext.currentLearnView !== "jteMatchR") return;
        setMatchItems(learnDataContext.words.map<MatchItem<string, string>>((word: Word) => ({
            id: word.id,
            question: (props.reverse) ? word.english : word.japanese,
            answer: (props.reverse) ? word.japanese : word.english,
            questionAudio: (props.reverse) ? "" : word.ttsPath,
            answerAudio: (props.reverse) ? word.ttsPath : "",
        })));
    }, [learnDataContext])

    return (
        <MatchView matchItems={matchItems}/>
    )
}
export default JapaneseToEnglishMatch
