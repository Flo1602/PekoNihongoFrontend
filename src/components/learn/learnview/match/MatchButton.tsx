import * as React from "react";
import {useAudio} from "@/hooks/useAudio.ts";
import {useEffect} from "react";
import {useSwipeable} from "react-swipeable";

export interface MatchButtonProps {
    id: string | number;
    onClick: () => void;
    onContextMenu: () => void;
    onKanjiInfoOpen?: () => void;
    disabled?: boolean;
    isCorrect?: boolean;
    isWrong?: boolean;
    isSelected?: boolean;
    ttsPath?: string;
    children: React.ReactNode;
}

const MatchButton: React.FC<MatchButtonProps> = ({
                                                     id,
                                                     onClick,
                                                     onContextMenu,
                                                     onKanjiInfoOpen,
                                                     disabled = false,
                                                     isCorrect = false,
                                                     isWrong = false,
                                                     isSelected = false,
                                                     ttsPath = "",
                                                     children,
                                                 }) => {
    const { play, setFilename, filename } = useAudio(ttsPath, { preload: "auto" });

    useEffect(() => {
        if(filename != ttsPath){
            setFilename(ttsPath);
        }
    }, [ttsPath]);

    const classes = [
        'btn w-full justify-start whitespace-normal line-clamp-2',
        'h-14 sm:h-16 lg:h-20 text-sm sm:text-base lg:text-xl',
        'transition-all hover:shadow-lg hover:scale-102 disabled:opacity-50 disabled:bg-base-100!',
        isCorrect ? 'bg-green-700 animate-pop' : '',
        isWrong ? 'bg-red-800 animate-shake' : '',
        !isSelected && !isCorrect && !isWrong && 'hover:bg-base-100',
        !isCorrect && !isWrong
            ? isSelected
                ? 'btn-primary btn-active'
                : 'btn-outline btn-soft'
            : '',
    ].filter(Boolean).join(' ');

    const handlers = useSwipeable({
        onSwipedUp: () => {if(onKanjiInfoOpen) onKanjiInfoOpen()},
        delta: 50,
        preventScrollOnSwipe: true,
        trackTouch: true,
    })

    const handleAuxClick = (e: React.MouseEvent) => {
        if (e.button === 1 && onKanjiInfoOpen) {
            onKanjiInfoOpen();

            e.preventDefault()
        }
    };

    return (
        <button
            {...handlers}
            type="button"
            onClick={() => {
                if(isCorrect || isWrong) return;

                onClick();

                if(ttsPath){
                    play();
                }
            }}
            onContextMenu={(e) => {e.preventDefault(); onContextMenu();}}
            onAuxClick={handleAuxClick}
            disabled={(!isCorrect && disabled)}
            className={classes}
            data-id={id}
        >
            <div className={"line-clamp-2 flex justify-center"}>
                {children}
            </div>

        </button>
    );
};

export default MatchButton;