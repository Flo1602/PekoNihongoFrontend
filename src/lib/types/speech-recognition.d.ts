export type SpeechRecognitionErrorCode =
    | "no-speech"
    | "audio-capture"
    | "not-allowed"
    | "service-not-allowed"
    | "network"
    | "aborted"
    | "language-not-supported"
    | string;

export interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

export interface SpeechRecognitionResult {
    isFinal: boolean;
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionEvent {
    readonly results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionErrorEvent {
    readonly error: SpeechRecognitionErrorCode;
    readonly message?: string;
}

export interface SpeechRecognition {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;

    start(): void;
    stop(): void;
    abort(): void;

    onaudiostart?: () => void;
    onaudioend?: () => void;
    onsoundstart?: () => void;
    onsoundend?: () => void;
    onspeechstart?: () => void;
    onspeechend?: () => void;
    onstart?: () => void;
    onend?: () => void;

    onerror?: (ev: SpeechRecognitionErrorEvent) => void;
    onresult?: (ev: SpeechRecognitionEvent) => void;
}

export interface SpeechRecognitionConstructor {
    new (): SpeechRecognition;
}

declare global {
    interface Window {
        webkitSpeechRecognition?: SpeechRecognitionConstructor;
        SpeechRecognition?: SpeechRecognitionConstructor;
    }
}
