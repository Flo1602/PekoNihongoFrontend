import LearnSession from "@/components/learn/session/LearnSession.tsx";
import {TestSessionStrategy} from "@/components/learn/session/TestSessionStrategy.ts";

const SpeakTheWord = () => {
    return (
        <LearnSession strategy={new TestSessionStrategy()}/>
    )
}
export default SpeakTheWord
