import {useContext} from "react";
import {LearnDataContext} from "@/contexts/LearnDataContext.tsx";

const KanjiDraw = () => {

    const learnDataContext = useContext(LearnDataContext);

    return (
        <div className="flex-1">{learnDataContext?.kanji?.symbol}</div>
    )
}
export default KanjiDraw
