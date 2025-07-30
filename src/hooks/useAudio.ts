import { useRef, useState, useEffect, useCallback } from "react";

interface UseAudioOptions {
    preload?: "auto" | "metadata" | "none";
    apiUrl?: string;
}

const SERVER_BASE_URL = window._env_.SERVER_BASE_URL;

export function useAudio(
    initialFilename?: string,
    {
        preload = "none",
        apiUrl = SERVER_BASE_URL + "resources/audio",
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
        const savedVolume = localStorage.getItem("volume");
        const volumeNumber = savedVolume !== null ? Number(savedVolume) : 0.5
        audio.volume = volumeNumber > 1 ? 1 : volumeNumber < 0 ? 0 : volumeNumber;
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
