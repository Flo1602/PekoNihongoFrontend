import {useEffect, useRef, useState} from "react";
import {
    motion,
    type Transition,
} from "framer-motion";

const POP_EASE: Transition["ease"] = [0.16, 1, 0.3, 1];
const DURATION_GAIN = 0.45;
const DURATION_LOSE = 0.45;
const DURATION_IDLE = 0.2;
const STAGGER = 0.06;

type Change = { from: number; to: number } | null;

function Hearts({ tries, max }: { tries: number; max: number }) {
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

export default Hearts;
