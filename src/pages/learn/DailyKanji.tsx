import LearnSession from "@/components/learn/session/LearnSession.tsx";
import {KanjiSessionStrategy} from "@/components/learn/session/KanjiSessionStrategy.ts";

const DailyKanji = () => {
    return (
        <LearnSession strategy={new KanjiSessionStrategy()}/>
    )
}
export default DailyKanji
