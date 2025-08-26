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
    const advanceQueue = useRef<null | { correct: boolean }>(null);
    const result = useRef<LearnResult[]>([]);

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

    useEffect(() => {
        if (!isFinal) return;
        if (!transcript || transcript.trim().length === 0) return;
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
    }, [transcript, isFinal]);

    useEffect(() => {
        if (tries <= 0) {
            queueFinish(false);
        }
    }, [tries]);

    const startListening = () => {
        if (!listening && !feedback) start();
    };

    if (words.length === 0) return <div className="flex-1"></div>;

    const currentWord = words[wordIndex];

    return (
        <div className="flex-1 flex flex-col p-6 space-y-6 lg:w-1/3 pt-10">
                <header className="flex items-center justify-between gap-5 lg:gap-0">
                    <h1 id="practice-title" className="text-xl md:text-2xl font-bold">
                        {t("speakTheWord")}
                    </h1>

                    <div className="flex items-center gap-2">
                        <Hearts tries={tries} />
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
                                // feedback nudge (shake/pulse)
                                variants={wordFeedback}
                                animate={feedback ?? "idle"}
                                aria-busy={!!listening}
                                className="relative px-6 py-6 rounded-2xl border border-base-300 bg-base-100 shadow-md"
                            >
                                {/* colored overlay for quick visual cue */}
                                <motion.div
                                    className="absolute inset-0 rounded-2xl pointer-events-none"
                                    variants={overlayVariants}
                                    animate={feedback ?? "idle"}
                                />

                                <div className="relative z-10 text-center">
                                    <div className="text-5xl md:text-6xl font-japanese leading-tight">
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

                    <div className="flex items-center justify-center pt-10">
                        <button
                            onClick={startListening}
                            disabled={listening || !!feedback}
                            aria-controls="practice-status"
                            className="btn btn-primary btn-lg w-full md:w-auto"
                        >
                            {listening ? (
                                <span className="inline-flex items-center gap-2">
              <span className="loading loading-spinner" aria-hidden="true" />
              🎙️ {t("translation:recording")}
            </span>
                            ) : (
                                <span className="inline-flex items-center gap-2">
              🎤 {t("translation:speakNow")}
              <span className="hidden md:inline text-base-content/70">
              </span>
            </span>
                            )}
                        </button>
                    </div>

                    {error && (
                        <p role="alert" className="text-error text-sm md:text-base">
                            {error}
                        </p>
                    )}
                </div>
        </div>
    );
};
export default WordSpeaking;

const POP_EASE: Transition["ease"] = [0.16, 1, 0.3, 1];
const DURATION_GAIN = 0.45;
const DURATION_LOSE = 0.45;
const DURATION_IDLE = 0.2;
const STAGGER = 0.06;

type Change = { from: number; to: number } | null;

export function Hearts({ tries, max = MAX_TRIES }: { tries: number; max?: number }) {
    const prevTriesRef = useRef(tries);
    const [change, setChange] = useState<Change>(null);
    const remaining = useRef(0);

    useEffect(() => {
        const prev = prevTriesRef.current;
        if (tries !== prev) {
            setChange({ from: prev, to: tries });
            remaining.current = Math.abs(tries - prev);
            prevTriesRef.current = tries;
        }
    }, [tries]);

    const getTransition = (isGain: boolean, isLose: boolean, delay: number): Transition => {
        if (isGain) return { duration: DURATION_GAIN, ease: POP_EASE, delay };
        if (isLose) return { duration: DURATION_LOSE, ease: POP_EASE, delay };
        return { duration: DURATION_IDLE, ease: "easeOut" };
    };

    return (
        <div className="inline-flex items-center gap-1 align-middle" aria-label={`${tries} Leben`}>
            {Array.from({ length: max }).map((_, i) => {
                const active = i < tries;

                const isGain = !!change && change.to > change.from && i >= change.from && i < change.to;
                const isLose = !!change && change.to < change.from && i >= change.to && i < change.from;

                const delay =
                    change == null
                        ? 0
                        : isGain
                            ? (i - change.from) * STAGGER
                            : isLose
                                ? (i - change.to) * STAGGER
                                : 0;

                return (
                    <motion.span
                        key={i}
                        className={`text-2xl leading-none ${active ? "" : "opacity-40 grayscale"}`}
                        initial={isGain ? { scale: 0, opacity: 0 } : false}
                        animate={
                            isLose
                                ? { scale: [1, 1.2, 0], rotate: [0, -10, 0], opacity: [1, 1, 0] }
                                : isGain
                                    ? { scale: [0, 1.4, 1], opacity: [0, 1, 1] }
                                    : { scale: 1, opacity: active ? 1 : 0.4 }
                        }
                        transition={getTransition(isGain, isLose, delay)}
                        onAnimationComplete={() => {
                            if (isGain || isLose) {
                                remaining.current -= 1;
                                if (remaining.current <= 0) setChange(null);
                            }
                        }}
                        role="img"
                        aria-label={active ? "volles Herz" : "leeres Herz"}
                    >
                        ❤️
                    </motion.span>
                );
            })}
        </div>
    );
}
