import SpeakerIcon from "@/assets/icons/SpeakerIcon.tsx";
import {useContext, useEffect, useRef, useState} from "react";
import {LearnDataContext} from "@/contexts/LearnDataContext.tsx";
import {shuffle} from "@/services/util/ArrayUtils.ts";
import {replaceKanjiWithRandom} from "@/services/util/KanjiUtil.tsx";
import {useAudio} from "@/hooks/useAudio.ts";
import {LearnManagerContext} from "@/contexts/LearnManagerContext.tsx";
import {useTranslation} from "react-i18next";

const WordKanjiSelect = () => {

    const learnDataContext = useContext(LearnDataContext);
    const learnManagerContext = useContext(LearnManagerContext);
    const {t} = useTranslation();

    const [word, setWord] = useState<{word: string, options: string[]}>();
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const [disabled, setDisabled] = useState<boolean>();
    const toolBarActive = useRef(false);
    const correctWord = useRef<string>("");
    const correctKanjiId = useRef<number>(0);

    const audio = useAudio();

    const checkCorrect = () =>{
        if(correctWord.current === word?.options[selectedIndex]){
            learnManagerContext?.onComplete(true);
            learnDataContext?.setResults([{id: correctKanjiId.current, correct: true}])
        } else {
            learnManagerContext?.onComplete(false);
            learnDataContext?.setResults([{id: correctKanjiId.current, correct: false}])
        }
        setDisabled(true);
    }

    useEffect(() => {
        if (!learnDataContext?.kanji || !learnDataContext?.words || !learnDataContext?.extraData) return;
        const words = learnDataContext.words;
        const options = [words[0].japanese, words[0].japanese, words[0].japanese]

        for (let i = 0; i < options.length; i++) {
            options[i] = replaceKanjiWithRandom(options[i], learnDataContext.extraData);
        }

        options.push(words[0].japanese);
        audio.setFilename(words[0].ttsPath);

        setTimeout(audio.play, 100);

        shuffle(options);

        setWord({word: words[0].kana, options: options});
        correctWord.current = words[0].japanese;
        correctKanjiId.current = learnDataContext.kanji.id;
        setDisabled(false);
    }, [learnDataContext]);

    useEffect(() => {
        if(disabled){
            learnManagerContext?.setToolbarActions([]);
        } else {
            learnManagerContext?.setToolbarActions([{key: "check",
                label: t("translation:check"),
                onClick: checkCorrect,
                disabled: true,
                className: ""}]);
        }
    }, [disabled]);

    useEffect(() => {
        if(!toolBarActive.current){
            learnManagerContext?.setToolbarActions([{key: "check",
                label: t("translation:check"),
                onClick: checkCorrect,
                disabled: false,
                className: ""}]);
        }
    }, [selectedIndex]);

    const buttonSelectHandler = (index: number): void =>{
        if(selectedIndex == index){
            checkCorrect();
        }

        setSelectedIndex(index);
    }

    return (
        <div className="flex-1 w-screen flex flex-col items-center justify-center p-4">
            <div className="flex items-center space-x-2 mb-8">
                <div onClick={audio.play} className="p-4">
                    <SpeakerIcon className={"h-7 w-7 hover:scale-120"}/>
                </div>
                <span className="text-white text-4xl font-semibold">{word?.word}</span>
            </div>

            <div className="grid grid-cols-2 gap-6 w-full max-w-md">
                {word?.options.map((opt, index) => (
                    <button
                        key={index}
                        disabled={disabled}
                        onClick={() => {buttonSelectHandler(index)}}
                        className={["btn w-full justify-start whitespace-normal line-clamp-2",
                            "h-14 sm:h-16 lg:h-20 text-sm sm:text-base lg:text-2xl text-xl",
                            "transition-all hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:bg-base-100!",
                            index === selectedIndex ? 'btn-primary btn-active' : 'btn-outline btn-soft hover:bg-base-100',
                        ].filter(Boolean).join(' ')}
                    >
                        {opt}
                    </button>
                ))}
            </div>

            {/*<div className="mt-10">*/}
            {/*    <button*/}
            {/*        className="flex items-center text-gray-400 hover:text-gray-200 transition"*/}
            {/*    >*/}
            {/*        <span className="font-bold mr-1">Skip:</span>*/}
            {/*    </button>*/}
            {/*</div>*/}
        </div>
    );
}
export default WordKanjiSelect
