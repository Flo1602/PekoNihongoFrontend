import {useSpeechToText} from "@/hooks/useSpeechToText.ts";
import {useContext, useEffect, useRef, useState} from "react";
import {LearnDataContext} from "@/contexts/LearnDataContext.tsx";
import {LearnManagerContext} from "@/contexts/LearnManagerContext.tsx";
import {useTranslation} from "react-i18next";
import type {Word} from "@/services/api/wordService.ts";
import {stringSimilarityPercent} from "@/services/util/StringUtils.ts";
import type {LearnResult} from "@/components/learn/session/types.ts";
import {getJapaneseSimilarity} from "@/services/api/utilsService.ts";
import {
    AnimatePresence,
    motion,
    type Transition,
    type Variants,
} from "framer-motion";
import Hearts from "@/components/learn/learnview/Hearts.tsx";

const MAX_TRIES = 3;

type Feedback = "correct" | "wrong" | null;

const FEEDBACK_MS = 550;
const EASE_POP: Transition["ease"] = [0.16, 1, 0.3, 1];

const wordEnterExit: Variants = {
    initial: { opacity: 0, y: 10, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, ease: "easeOut" } },
    exit:   { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.18, ease: "easeIn" } },
};

const wordFeedback: Variants = {
    idle: { scale: 1, x: 0, transition: { duration: 0.2 } },
    correct: {
        scale: [1, 1.06, 1],
        y: [0, -3, 0],
        transition: { duration: 0.45, ease: EASE_POP },
    },
    wrong: {
        x: [0, -8, 8, -6, 6, -3, 3, 0],
        transition: { duration: 0.45, ease: "easeInOut" },
    },
};

const overlayVariants: Variants = {
    idle: { opacity: 0 },
    correct: { opacity: 1, backgroundColor: "rgba(34,197,94,0.18)", transition: { duration: 0.25 } }, // tailwind success-ish
    wrong: { opacity: 1, backgroundColor: "rgba(239,68,68,0.20)", transition: { duration: 0.25 } },  // tailwind error-ish
};

const badgeVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: 6 },
    show:   { opacity: 1, scale: 1,   y: 0, transition: { duration: 0.25, ease: EASE_POP } },
    out:    { opacity: 0, scale: 0.8, y: -6, transition: { duration: 0.18, ease: "easeIn" } },
};

const WordSpeaking = () => {
    const learnDataContext = useContext(LearnDataContext);
    const learnManagerContext = useContext(LearnManagerContext);
    const { t } = useTranslation();

    const {
        listening,
        transcript,
        error,
        start,
        stop,
        isFinal
    } = useSpeechToText({
        lang: "ja-JP",
        interimResults: false,
        continuous: false,
        maxAlternatives: 3,
    });

    const [words, setWords] = useState<Word[]>([]);
    const [wordIndex, setWordIndex] = useState<number>(0);
    const [tries, setTries] = useState<number>(MAX_TRIES);
    const [feedback, setFeedback] = useState<Feedback>(null);
    const [write, setWrite] = useState<boolean>(false);
    const [textTry, setTextTry] = useState<string>("");
    const advanceQueue = useRef<null | { correct: boolean }>(null);
    const result = useRef<LearnResult[]>([]);
    const textField = useRef<HTMLInputElement | null>(null)

    useEffect(() => () => { stop(); }, [stop]);

    useEffect(() => {
        if (!learnDataContext?.words) return;
        if (learnDataContext.currentLearnView !== "wordSpeaking") return;

        setWordIndex(0);
        setTries(MAX_TRIES);
        setWords(learnDataContext.words);
        result.current = [];
        setFeedback(null);
        advanceQueue.current = null;
    }, [learnDataContext]);

    useEffect(() => {
        if (!feedback || !advanceQueue.current) return;
        const id = setTimeout(() => {
            const { correct } = advanceQueue.current!;
            result.current.push({ id: words[wordIndex].id, correct });
            advanceQueue.current = null;

            if (wordIndex < words.length - 1) {
                setWordIndex((i) => i + 1);
                setTries(MAX_TRIES);
                setFeedback(null);
            } else {
                learnManagerContext?.onComplete(true);
                learnDataContext?.setResults(result.current);
            }
        }, FEEDBACK_MS);
        return () => clearTimeout(id);
    }, [feedback, wordIndex, words, learnDataContext, learnManagerContext]);

    const queueFinish = (correct: boolean) => {
        setFeedback(correct ? "correct" : "wrong");
        advanceQueue.current = { correct };
    };

    const checkSimilarity = (transcript: string) => {
        const similarity = stringSimilarityPercent(words[wordIndex].japanese, transcript);

        if (similarity >= 75) {
            queueFinish(true);
        } else {
            getJapaneseSimilarity(transcript, words[wordIndex].kana)
                .then((res) => {
                    if (res.data >= 50) {
                        queueFinish(true);
                    } else {
                        setTries((t) => t - 1);
                    }
                })
                .catch(() => setTries((t) => t - 1));
        }
    };

    useEffect(() => {
        if (!isFinal) return;
        if (!transcript || transcript.trim().length === 0) return;

        checkSimilarity(transcript);
    }, [transcript, isFinal]);

    useEffect(() => {
        if (tries <= 0) {
            queueFinish(false);
        }
    }, [tries]);

    const startListening = () => {
        if (!listening && !feedback) start();
    };

    const textChange = (changeEvent: React.ChangeEvent<HTMLInputElement>)=> {
        setTextTry(changeEvent.target.value);
    }

    useEffect(() => {
        if(!write && textTry.trim() !== ""){
            checkSimilarity(textTry);
            setTextTry("");

            if(textField.current)
                textField.current.value = "";
        } else if(write){
            textField.current?.focus();
        }
    }, [write]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" && !(listening || !!feedback)) {
                setWrite(!write);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [feedback, listening, write]);

    if (words.length === 0) return <div className="flex-1"></div>;

    const currentWord = words[wordIndex];

    return (
        <div className="flex-1 flex flex-col p-6 space-y-6 lg:w-1/3 pt-10">
                <header className="flex items-center justify-between gap-5 lg:gap-0">
                    <h1 id="practice-title" className="text-xl md:text-2xl font-bold">
                        {t("speakTheWord")}
                    </h1>

                    <div className="flex items-center gap-2">
                        <Hearts tries={tries} max={MAX_TRIES} />
                    </div>
                </header>

                <div className="flex-1 flex flex-col items-center justify-center">
                    <AnimatePresence mode="popLayout">
                        <motion.div
                            key={currentWord.id}
                            variants={wordEnterExit}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="relative select-none"
                        >
                            <motion.div
                                variants={wordFeedback}
                                animate={feedback ?? "idle"}
                                aria-busy={listening}
                                className="relative px-6 py-6 rounded-2xl border border-base-300 bg-base-100 shadow-md"
                            >
                                <motion.div
                                    className="absolute inset-0 rounded-2xl pointer-events-none"
                                    variants={overlayVariants}
                                    animate={feedback ?? "idle"}
                                />

                                <div className="relative z-10 text-center">
                                    <div className="text-5xl md:text-6xl font-japanese leading-tight tooltip tooltip-top" data-tip={currentWord.english}>
                                        {currentWord.japanese}
                                    </div>


                                    {transcript && (
                                        <div className="mt-3 flex items-center justify-center gap-3 text-sm md:text-base">
                                            <span className="opacity-90">
                                                {t("translation:youSayed")}: <strong>{transcript}</strong>
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {feedback && (
                                        <motion.div
                                            key={`badge-${feedback}-${wordIndex}`}
                                            variants={badgeVariants}
                                            initial="hidden"
                                            animate="show"
                                            exit="out"
                                            className={`absolute -top-3 -right-3 z-20 rounded-full px-2 py-1 text-sm font-semibold ${
                                                feedback === "correct"
                                                    ? "bg-success text-success-content"
                                                    : "bg-error text-error-content"
                                            }`}
                                        >
                                            {feedback === "correct" ? "✓" : "✗"}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        </motion.div>
                    </AnimatePresence>

                    <div className="flex flex-col items-center justify-center pt-10 gap-5">
                        <button
                            onClick={startListening}
                            disabled={listening || !!feedback}
                            aria-controls="practice-status"
                            className="btn btn-primary btn-lg w-full md:w-auto"
                            hidden={write}
                        >
                            {listening ? (
                                <span className="inline-flex items-center gap-2">
                                    <span className="loading loading-bars" aria-hidden="true" />
                                    🎙️ {t("translation:recording")}
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2">
                                    🎤 {t("translation:speakNow")}
                                    <span className="hidden md:inline text-base-content/70"/>
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => { setWrite(!write); }}
                            disabled={listening || !!feedback}
                            aria-controls="practice-status"
                            className={"btn btn-primary w-full md:w-auto " + (!write ? "btn-outline" : "")}
                        >
                            <span className="inline-flex items-center">
                                {write ? t("translation:submit") : "✒️ " + t("translation:write")}
                                <span className="hidden md:inline"/>
                            </span>
                        </button>

                        <input id="textTry" ref={textField} type="text" placeholder={t("translation:typeHere")} className="input" onChange={textChange} hidden={!write}/>
                    </div>

                    {error && (
                        <p role="alert" className="text-error text-sm md:text-base pt-5">
                            {error}
                        </p>
                    )}
                </div>
        </div>
    );
};

export default WordSpeaking;