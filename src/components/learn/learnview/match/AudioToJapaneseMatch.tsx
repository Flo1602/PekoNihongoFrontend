import MatchView from "@/components/learn/learnview/match/MatchView.tsx";
import {type ReactNode, useContext, useEffect, useState} from "react";
import type {MatchItem} from "@/components/learn/learnview/match/types.ts";
import {LearnDataContext} from "@/contexts/LearnDataContext.tsx";
import type {Word} from "@/services/api/wordService.ts";
import SpeakerIcon from "@/assets/icons/SpeakerIcon.tsx";

const AudioToJapaneseMatch = () => {

    const [ matchItems, setMatchItems] = useState<MatchItem<ReactNode, string>[]>([]);
    const learnDataContext = useContext(LearnDataContext);

    useEffect(() => {
        if (!learnDataContext?.words) return;
        setMatchItems(learnDataContext.words.map<MatchItem<ReactNode, string>>((word: Word) => ({
            id: word.id,
            question: (<SpeakerIcon className="w-8 h-8 lg:w-10 lg:h-10"/>),
            answer: word.japanese,
            questionAudio: word.ttsPath,
            answerAudio: ''
        })));
    }, [learnDataContext])

    return (
        <MatchView matchItems={matchItems}/>
    )
}
export default AudioToJapaneseMatch
