import LearnSession from "@/components/learn/session/LearnSession.tsx";
import {WordSessionStrategy} from "@/components/learn/session/WordSessionStrategy.ts";

const DailyWords = () => {
    return (
        <LearnSession strategy={new WordSessionStrategy()}/>
    )
}
export default DailyWords
