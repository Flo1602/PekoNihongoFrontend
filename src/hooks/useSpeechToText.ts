import type {
    SpeechRecognition,
    SpeechRecognitionConstructor,
    SpeechRecognitionErrorEvent, SpeechRecognitionEvent
} from "@/lib/types/speech-recognition";
import {useCallback, useEffect, useRef, useState} from "react";

export interface UseSpeechToTextOptions {
    lang?: string;             // z.B. "ja-JP"
    interimResults?: boolean;  // Zwischenstände ausgeben
    continuous?: boolean;      // fortlaufend zuhören
    maxAlternatives?: number;  // Anzahl Alternativen
    autoRestartOnEnd?: boolean;// bei continuous sinnvoll
}

export interface UseSpeechToTextState {
    supported: boolean;
    listening: boolean;
    transcript: string;
    alternatives: SpeechRecognitionAlternative[];
    confidence: number | null;
    isFinal: boolean;
    error: string | null;
    language: string;
}

export interface UseSpeechToTextControls {
    start: () => void;
    stop: () => void;
    abort: () => void;
    setLanguage: (lang: string) => void;
    reset: () => void;
}

export type UseSpeechToTextReturn = UseSpeechToTextState & UseSpeechToTextControls;

function getConstructor(): SpeechRecognitionConstructor | null {
    if (typeof window === "undefined") return null;
    return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

export function useSpeechToText(options?: UseSpeechToTextOptions): UseSpeechToTextReturn {
    const {
        lang = "ja-JP",
        interimResults = false,
        continuous = false,
        maxAlternatives = 1,
        autoRestartOnEnd = false,
    } = options ?? {};

    const RecognitionCtor = getConstructor();

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const [language] = useState<string>(lang);

    const [listening, setListening] = useState<boolean>(false);
    const [transcript, setTranscript] = useState<string>("");
    const [alternatives, setAlternatives] = useState<SpeechRecognitionAlternative[]>([]);
    const [confidence, setConfidence] = useState<number | null>(null);
    const [isFinal, setIsFinal] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const supported = Boolean(RecognitionCtor);

    const ensureInstance = useCallback(() => {
        if (!RecognitionCtor) return null;
        if (recognitionRef.current) return recognitionRef.current;

        const instance = new RecognitionCtor();
        instance.lang = language;
        instance.interimResults = interimResults;
        instance.continuous = continuous;
        instance.maxAlternatives = maxAlternatives;

        instance.onstart = () => {
            setListening(true);
            setError(null);
            setIsFinal(false);
        };

        instance.onend = () => {
            setListening(false);
            if (autoRestartOnEnd && continuous && !error) {
                window.setTimeout(() => {
                    try {
                        instance.start();
                    } catch {
                        // ignore
                    }
                }, 150);
            }
        };

        instance.onerror = (ev: SpeechRecognitionErrorEvent) => {
            setError(ev.error ?? "recognition-error");
            setListening(false);
        };

        instance.onresult = (ev: SpeechRecognitionEvent) => {
            const lastIndex = ev.results.length - 1;
            const result = ev.results.item(lastIndex);

            const picked: SpeechRecognitionAlternative[] = [];
            for (let i = 0; i < result.length; i++) {
                picked.push(result.item(i));
            }

            setAlternatives(picked);

            const best = picked[0];
            setTranscript(best?.transcript ?? "");
            setConfidence(typeof best?.confidence === "number" ? best.confidence : null);
            setIsFinal(result.isFinal);
        };

        recognitionRef.current = instance;
        return instance;
    }, [RecognitionCtor, language, interimResults, continuous, maxAlternatives, autoRestartOnEnd, error]);

    const start = useCallback(() => {
        if (!supported) {
            setError("Speech Recognition not supported in this browser.");
            return;
        }
        const inst = ensureInstance();
        if (!inst) return;

        inst.lang = language;
        inst.interimResults = interimResults;
        inst.continuous = continuous;
        inst.maxAlternatives = maxAlternatives;

        try {
            inst.start();
        } catch (e) {
            setError("Failed to start Speech Recognition.");
            console.error(e);
        }
    }, [supported, ensureInstance, language, interimResults, continuous, maxAlternatives]);

    const stop = useCallback(() => {
        recognitionRef.current?.stop();
    }, []);

    const abort = useCallback(() => {
        recognitionRef.current?.abort();
        setListening(false);
    }, []);

    const reset = useCallback(() => {
        setTranscript("");
        setAlternatives([]);
        setConfidence(null);
        setIsFinal(false);
        setError(null);
    }, []);

    const setLanguage = useCallback((l: string) => {
        setLanguage(l);
        if (recognitionRef.current) {
            recognitionRef.current.lang = l;
        }
    }, []);

    useEffect(() => {
        return () => {
            recognitionRef.current?.abort();
            recognitionRef.current = null;
        };
    }, []);

    return {
        supported,
        listening,
        transcript,
        alternatives,
        confidence,
        isFinal,
        error,
        language,
        start,
        stop,
        abort,
        setLanguage,
        reset,
    };
}