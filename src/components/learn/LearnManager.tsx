import type {LearnViewKey, ToolbarAction} from "@/components/learn/learnview/types.ts";
import {LearnManagerContext} from "@/contexts/LearnManagerContext";
import {type ReactNode, useContext, useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import BackArrowIcon from "@/assets/icons/BackArrowIcon.tsx";
import type {LearnData} from "@/components/learn/session/types.ts";
import {LearnDataContext} from "@/contexts/LearnDataContext.tsx";
import AudioToJapaneseMatch from "@/components/learn/learnview/match/AudioToJapaneseMatch.tsx";
import AudioToEnglishMatch from "@/components/learn/learnview/match/AudioToEnglishMatch.tsx";
import JapaneseToKanaMatch from "@/components/learn/learnview/match/JapaneseToKanaMatch.tsx";
import JapaneseToEnglishMatch from "@/components/learn/learnview/match/JapaneseToEnglishMatch.tsx";
import KanjiDraw from "@/components/learn/learnview/KanjiDraw.tsx";
import WordKanjiSelect from "@/components/learn/learnview/WordKanjiSelect.tsx";

interface Props {
    currentView: LearnViewKey;
    nextView: () => void;
    viewCount: number;
    retry: boolean;
    setRetry: (finishedRetry: boolean) => void;
    pushFalseView: (view: LearnViewKey, data: LearnData | null) => void;
}

const viewRegistry: Record<LearnViewKey, ReactNode> = {
    jtkMatch: <JapaneseToKanaMatch/>,
    jtkMatchR: <JapaneseToKanaMatch reverse={true}/>,
    atjMatch: <AudioToJapaneseMatch/>,
    ateMatch: <AudioToEnglishMatch/>,
    jteMatch: <JapaneseToEnglishMatch/>,
    jteMatchR: <JapaneseToEnglishMatch reverse={true}/>,
    kanjiDraw: <KanjiDraw traceMode="NO_HINTS" debug={true} />,
    wordKanjiSelect: <WordKanjiSelect/>
};

const LearnManager = (probs: Props) => {
    const navigate = useNavigate();
    const [learnViewCorrect, setLearnViewCorrect] = useState<boolean | null>(null);
    const [numberCorrect, setNumberCorrect] = useState<number>(0);
    const [toolbarActions, setToolbarActions] = useState<ToolbarAction[]>([]);
    const falseViews = useRef<{view: LearnViewKey, data: LearnData | null}[]>([]);

    const learnDataContext = useContext(LearnDataContext);

    useEffect(() => {
        if (probs.retry){
            if(falseViews.current.length === 0){
                probs.setRetry(false);
            } else {
                onNextHandler();
            }
        }
    }, [probs.retry]);

    const onComplete = (correct: boolean) => {
        if (correct) {
            setNumberCorrect(numberCorrect + 1);
        } else {
            falseViews.current.push({view: probs.currentView, data: learnDataContext})
        }
        setLearnViewCorrect(correct);
    };

    const currentView = viewRegistry[probs.currentView];

    useEffect(() => {
        setToolbarActions([]);
    }, [currentView]);

    const onNextHandler = () => {
        setLearnViewCorrect(null);

        if(probs.retry){
            const falseView = falseViews.current.shift();
            if(falseView !== undefined){
                probs.pushFalseView(falseView.view, falseView.data);
            } else {
                probs.setRetry(false);
            }
        } else {
            probs.nextView();
        }
    }

    const percentage = Math.round((numberCorrect / probs.viewCount) * 100);

    return (
        <div className="flex-1 flex flex-col items-center justify-center bg-base-300">
            <div className="flex items-center pt-6 w-screen">
                <div onClick={() => navigate(-1)} className="absolute lg:ml-6 ml-4 ">
                    <BackArrowIcon className={"h-7 w-7 hover:scale-120"}/>
                </div>
                <div className="flex-1 flex justify-center">
                    <div className="w-3/5 sm:w-1/2 lg:w-1/4 h-6 bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-primary transition-all duration-500"
                             style={{width: `${percentage}%`}}/>
                    </div>
                </div>
            </div>
            <LearnManagerContext.Provider value={{onComplete: onComplete, setToolbarActions: setToolbarActions}}>
                {currentView}
            </LearnManagerContext.Provider>

            <div
                className={
                    [
                        "relative flex items-center h-30 pr-5 pl-5 lg:pr-10 lg:pl-10 w-screen border-t border-gray-800",
                        "transition-colors duration-500",
                        learnViewCorrect === true && "bg-base-100",
                        learnViewCorrect === false && "bg-base-100"
                    ]
                        .filter(Boolean)
                        .join(" ")
                }
            >
                <span
                    key={String(learnViewCorrect)}
                    className={
                        [
                            "absolute left-1/2 -translate-x-1/2",
                            "text-3xl lg:text-4xl font-bold",
                            "animate-pop2",
                            learnViewCorrect === true && "text-success",
                            learnViewCorrect === false && "text-error",
                        ]
                            .filter(Boolean)
                            .join(" ")
                    }
                >
                    {learnViewCorrect === true && "Correct"}
                    {learnViewCorrect === false && "Wrong"}
                </span>

                {toolbarActions.map((a) => (
                    <button
                        key={a.key}
                        onClick={a.onClick}
                        disabled={a.disabled}
                        className={[
                            a.className,
                            "btn btn-soft",
                            "lg:text-xl",
                            "h-5/12",
                            "hover:scale-110 hover:bg-base-100",
                        ]
                            .filter(Boolean)
                            .join(" ")}
                    >
                        {a.label}
                    </button>
                ))}

                <button
                    disabled={learnViewCorrect === null}
                    className={
                        [
                            "btn ml-auto",
                            "transition-colors duration-500",
                            "lg:text-xl h-5/12 hover:scale-110",
                            learnViewCorrect === true && "btn-success",
                            learnViewCorrect === false && "btn-error"
                        ]
                            .filter(Boolean)
                            .join(" ")
                    }
                    onClick={onNextHandler}
                >
                    Continue
                </button>
            </div>
        </div>
    )
}
export default LearnManager
