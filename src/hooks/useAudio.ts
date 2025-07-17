import { useRef, useState, useEffect, useCallback } from "react";

interface UseAudioOptions {
    preload?: "auto" | "metadata" | "none";
    apiUrl?: string;
}

export function useAudio(
    filename?: string,
    {
        preload = "none",
        apiUrl = "http://10.0.0.8:8080/audio",
    }: UseAudioOptions = {}
) {
    const src = filename ? `${apiUrl}/${filename}` : null;
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [playing, setPlaying] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";            // unload
            audioRef.current.load();
            audioRef.current = null;
        }

        if (!src) {
            setPlaying(false);
            return;
        }

        const audio = new Audio(src);
        audio.preload = preload;

        const handleEnded = () => setPlaying(false);
        const handlePlay  = () => setPlaying(true);
        const handlePause = () => setPlaying(false);

        audio.addEventListener("ended", handleEnded);
        audio.addEventListener("play",  handlePlay);
        audio.addEventListener("pause", handlePause);

        audioRef.current = audio;

        return () => {
            audio.removeEventListener("ended", handleEnded);
            audio.removeEventListener("play",  handlePlay);
            audio.removeEventListener("pause", handlePause);

            audio.pause();
            audio.currentTime = 0;
        };
    }, [src, preload]);

    const play = useCallback(async () => {
        if (!audioRef.current) return;          // no-op if no file
        try {
            await audioRef.current.play();
        } catch (err) {
            setError(err as Error);
        }
    }, []);

    const pause = useCallback(() => {
        audioRef.current?.pause();
    }, []);

    const toggle = useCallback(() => {
        if (playing) {
            pause();
        } else {
            play();
        }
    }, [playing, play, pause]);

    return { play, pause, toggle, playing, error };
}
