import * as React from "react";
import {useAudio} from "@/hooks/useAudio.ts";

export interface MatchButtonProps {
    id: string | number;
    onClick: () => void;
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
                                                     disabled = false,
                                                     isCorrect = false,
                                                     isWrong = false,
                                                     isSelected = false,
                                                     ttsPath = "",
                                                     children,
                                                 }) => {
    const { play } = useAudio(ttsPath, { preload: "auto" });

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

    return (
        <button
            type="button"
            onClick={() => {
                onClick();
                if(ttsPath){
                    play();
                }
            }}
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