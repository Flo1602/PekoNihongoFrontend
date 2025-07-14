import {deleteWord, type Word} from "@/services/api/wordService.ts";
import DeleteIcon from "@/assets/icons/DeleteIcon.tsx";
import SentenceIcon from "@/assets/icons/SentenceIcon.tsx";
import SpeakerIcon from "@/assets/icons/SpeakerIcon.tsx";
import {useTranslation} from "react-i18next";
import {useAudio} from "@/hooks/useAudio.ts";
import SpeakerDisabledIcon from "@/assets/icons/SpeakerDisabledIcon.tsx";

interface Props {
    word: Word;
    refetechPage: () => void;
    openEditWordModal: (word: Word) => void;
}

const WordListEntry = ({word, refetechPage, openEditWordModal}: Props) => {

    const {t} = useTranslation();
    const { play, error } = useAudio(word.ttsPath, { preload: "metadata" });

    const deleteHandler = () => {
        deleteWord(word.id).then((res) => {
            if(res.data === true){
                refetechPage();
            }
        }
        )
    }

    const editHandler = () => {
        openEditWordModal(word);
    }

    return (
        <li className="
            flex items-center justify-between gap-3
            px-4 py-3
            rounded-lg bg-base-200/60
            hover:bg-base-300/60
            transition-colors cursor-pointer
            shadow-sm focus-within:ring focus-within:ring-primary/50"
        >
            <div className="flex flex-col min-w-0">
                <span className="font-medium leading-tight truncate">
                    {word.japanese}
                    {word.japanese !== word.kana && <span className="opacity-70"> ({word.kana})</span>}
                </span>

                <span className="text-[10px] uppercase tracking-widest opacity-60">
                    {word.english}
                </span>
            </div>

            <div className="flex shrink-0 gap-1">
                <button
                    aria-label="Play pronunciation"
                    className="btn btn-circle btn-ghost btn-xs tooltip"
                    data-tip={error ? "" : t("translation:playAudio")}
                    onClick={play}
                    disabled={!word.ttsPath}
                >
                    {!word.ttsPath ?
                        <SpeakerDisabledIcon className="h-4 w-4"/>
                        :
                        <>
                            {!error && <SpeakerIcon className="h-4 w-4"/>}
                            {error && <span className="text-error">⚠️ Audio error</span>}
                        </>
                    }

                </button>

                <button
                    aria-label="Example sentence"
                    className="btn btn-circle btn-ghost btn-xs tooltip"
                    data-tip={t("translation:edit")}
                    onClick={editHandler}
                >
                    <SentenceIcon className="h-4 w-4"/>
                </button>

                <button
                    aria-label="Delete word"
                    className="btn btn-circle btn-ghost btn-xs tooltip text-error"
                    data-tip={t("translation:delete")}
                    onClick={deleteHandler}
                >
                    <DeleteIcon className="h-4 w-4"/>
                </button>
            </div>
        </li>
    )
}
export default WordListEntry
