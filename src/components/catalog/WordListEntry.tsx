import DeleteIcon from "@/assets/icons/DeleteIcon.tsx";
import SentenceIcon from "@/assets/icons/SentenceIcon.tsx";
import SpeakerIcon from "@/assets/icons/SpeakerIcon.tsx";
import {useTranslation} from "react-i18next";
import {useAudio} from "@/hooks/useAudio.ts";
import SpeakerDisabledIcon from "@/assets/icons/SpeakerDisabledIcon.tsx";
import * as React from "react";
import type {Word} from "@/services/api/wordService.ts";
import DoubleCheckIcon from "@/assets/icons/DoubleCheckIcon.tsx";

interface Props {
    word: Word;
    openEditWordModal?: (word: Word) => void;
    deleteWordFetch?: (id: number) => void;
    activateWordDraftFetch?: (id: number) => void;
    noEdit?: boolean;
    draft?: boolean;
    draftCreate?: boolean;
    createDraft?: (word: Word) => void;
}

const WordListEntry = ({word, openEditWordModal, deleteWordFetch, noEdit, draft, activateWordDraftFetch, draftCreate, createDraft}: Props) => {

    const {t} = useTranslation();
    const { play, error } = useAudio(word.ttsPath, { preload: "metadata" });

    const deleteHandler = () => {
        const confirmed = window.confirm(
            t("translation:confirmDeleteWord")
        );
        if (!confirmed) return;

        if (deleteWordFetch) {
            deleteWordFetch(word.id);
        }

    }

    const editHandler = () => {
        if(!openEditWordModal) return;
        openEditWordModal(word);
    }

    const activateHandler = () => {
        if(!activateWordDraftFetch) return;
        activateWordDraftFetch(word.id);
    }

    const createDraftHandler = () => {
        if(!createDraft) return;
        createDraft(word);
    }

    const handleContextClick = (e: React.MouseEvent) => {
        window.open("https://jpdb.io/search?q=" + word.japanese +"&lang=english#a", "_blank");
        e.preventDefault();
    };

    return (
        <li className="
            flex items-center justify-between
            px-4 py-3
            rounded-lg bg-base-200/60
            hover:bg-base-300/60
            transition-colors cursor-pointer
            shadow-sm"
            onContextMenu={handleContextClick}
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

            <div className="flex shrink-0 gap-1 items-center z-10">
                { !draft && !draftCreate &&
                    <button
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
                }

                { draft && word.japanese.trim() !== "" && word.kana.trim() !== "" && word.english.trim() !== "" &&
                    <button
                        className="btn btn-circle btn-ghost btn-xs tooltip text-success"
                        data-tip={t("translation:activateWordDraft")}
                        onClick={activateHandler}
                    >
                        <DoubleCheckIcon className="h-4 w-4"/>
                    </button>
                }

                { draftCreate &&
                    <button
                        className="btn btn-ghost btn-sm tooltip btn-outline btn-info"
                        data-tip={t("translation:addDraft")}
                        onClick={createDraftHandler}
                    >
                        {t("translation:add")}
                    </button>
                }

                {!noEdit && (<>
                    <button
                        className="btn btn-circle btn-ghost btn-xs tooltip"
                        data-tip={t("translation:edit")}
                        onClick={editHandler}
                    >
                        <SentenceIcon className="h-4 w-4"/>
                    </button>

                    <button
                        className="btn btn-circle btn-ghost btn-xs tooltip text-error"
                        data-tip={t("translation:delete")}
                        onClick={deleteHandler}
                    >
                        <DeleteIcon className="h-4 w-4"/>
                    </button>
                </>)}
            </div>
        </li>
    )
}
export default WordListEntry
