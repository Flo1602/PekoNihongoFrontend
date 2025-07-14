import { useRef, useState, useEffect, useCallback } from "react";

interface UseAudioOptions {
    preload?: "auto" | "metadata" | "none";
    apiUrl?: string;
}

export function useAudio(
    filename: string,
    { preload = "none", apiUrl = "http://10.0.0.8:8080/audio" }: UseAudioOptions = {}
) {
    const src = `${apiUrl}/${filename}`;
    const audioRef = useRef<HTMLAudioElement>(new Audio(src));
    const [playing, setPlaying] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const audio = audioRef.current;
        audio.src = src;
        audio.preload = preload;
        setPlaying(false);
        setError(null);

        return () => {
            audio.pause();
            audio.currentTime = 0;
        };
    }, [src, preload]);

    const play = useCallback(() => {
        audioRef.current
            .play()
            .then(() => setPlaying(true))
            .catch(err => setError(err));
    }, []);

    const pause = useCallback(() => {
        audioRef.current.pause();
        setPlaying(false);
    }, []);

    const toggle = useCallback(() => {
        if (playing) {
            pause();
        } else {
            play();
        }
    }, [playing, play, pause]);

    return {
        play,
        pause,
        toggle,
        playing,
        error,
    };
}
