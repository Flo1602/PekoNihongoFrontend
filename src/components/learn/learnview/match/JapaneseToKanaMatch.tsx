import {useContext, useEffect, useState} from 'react'
import type {MatchItem} from "@/components/learn/learnview/match/types.ts";
import {LearnDataContext} from "@/contexts/LearnDataContext.tsx";
import type {Word} from "@/services/api/wordService.ts";
import MatchView from "@/components/learn/learnview/match/MatchView.tsx";
import {getRandomElements} from "@/services/util/RandomUtils.ts";

interface Props{
    reverse?: boolean;
}
const JapaneseToKanaMatch = (props: Props) => {
    const [ matchItems, setMatchItems] = useState<MatchItem<string, string>[]>([]);
    const learnDataContext = useContext(LearnDataContext);

    useEffect(() => {
        if (!learnDataContext?.words) return;
        if(learnDataContext.currentLearnView !== "jtkMatch" && learnDataContext.currentLearnView !== "jtkMatchR") return;
        let matchItems = learnDataContext.words.map<MatchItem<string, string>>((word: Word) => ({
            id: word.id,
            question: (props.reverse) ? word.kana : word.japanese,
            answer: (props.reverse) ? word.japanese : word.kana,
            questionAudio: (props.reverse) ? "" : word.ttsPath,
            answerAudio: (props.reverse) ? word.ttsPath : ""
        }));

        matchItems = [matchItems[0], ...getRandomElements([matchItems[1], matchItems[2], matchItems[3], matchItems[4]], 4)];

        setMatchItems(matchItems);
    }, [learnDataContext])

    return (
        <MatchView matchItems={matchItems}/>
    )
}
export default JapaneseToKanaMatch
