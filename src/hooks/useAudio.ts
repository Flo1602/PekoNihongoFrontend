import { useRef, useState, useEffect, useCallback } from "react";

interface UseAudioOptions {
    preload?: "auto" | "metadata" | "none";
    apiUrl?: string;
}

export function useAudio(
    initialFilename?: string,
    {
        preload = "none",
        // @ts-ignore
        apiUrl = server_base_url + "resources/audio",
    }: UseAudioOptions = {}
) {
    const [filename, setFilename] = useState<string | undefined>(
        initialFilename
    );

    const src = filename ? `${apiUrl}/${filename}` : null;

    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [playing, setPlaying] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = "";
            audioRef.current.load();
            audioRef.current = null;
        }

        if (!src) {
            setPlaying(false);
            return;
        }

        const audio = new Audio(src);
        audio.preload = preload;

        const onPlay   = () => setPlaying(true);
        const onPause  = () => setPlaying(false);
        const onEnded  = () => setPlaying(false);

        audio.addEventListener("play", onPlay);
        audio.addEventListener("pause", onPause);
        audio.addEventListener("ended", onEnded);

        audioRef.current = audio;

        return () => {
            audio.removeEventListener("play", onPlay);
            audio.removeEventListener("pause", onPause);
            audio.removeEventListener("ended", onEnded);
            audio.pause();
            audio.currentTime = 0;
        };
    }, [src, preload]);

    const play = useCallback(async () => {
        if (!audioRef.current) return;
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

    return {
        play,
        pause,
        toggle,

        playing,
        error,

        setFilename,
        filename
    };
}
