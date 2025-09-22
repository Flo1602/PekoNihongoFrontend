import {type KeyboardEvent, useEffect, useRef, useState} from "react";
import {useTranslation} from "react-i18next";
import {quickAddSearch} from "@/services/api/wordDraftService.ts";
import type {Word} from "@/services/api/wordService.ts";
import WordListEntry from "@/components/catalog/WordListEntry.tsx";
import Loading from "@/components/Loading.tsx";

interface Props {
    elementId: string;
    createDraft: (word: Word) => void;
}

const QuickAddWordModal = ({elementId, createDraft}: Props) => {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const searchFieldRef = useRef<HTMLInputElement>(null);
    const [words, setWords] = useState<Word[]>([]);
    const [loading, setLoading] = useState(false);
    const {t} = useTranslation();

    const handleSearch = () => {
        if(!searchFieldRef.current) return;
        setLoading(true);
        quickAddSearch(searchFieldRef.current.value).then((res) => {
            setWords(res.data);
        }).finally(() => setLoading(false));
    }

    const createDraftHandler = (word: Word) => {
        createDraft(word);
        (document.getElementById(elementId) as HTMLDialogElement)?.close();
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    useEffect(() => {
        const dlg = dialogRef.current;
        if (!dlg) return;

        const originalShow = dlg.showModal;
        dlg.showModal = function patchedShow(this: HTMLDialogElement) {
            originalShow.call(this);
            setTimeout(() => {
                setWords([]);
                if(searchFieldRef.current)
                    searchFieldRef.current.value = "";
                searchFieldRef.current?.focus();
            }, 50);
        };

        return () => {
            dlg.showModal = originalShow;
        };
    }, []);

    return (
        <dialog
            id={elementId}
            ref={dialogRef}
            className="modal modal-bottom sm:modal-middle"
        >
            <div className="modal-box">
                <form method="dialog">
                    <button
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </form>

                <h3 className="font-bold text-lg mb-4 text-center">{t("translation:quickAdd")}</h3>

                <div className="flex-1 flex flex-col space-y-4">
                    <input
                        id="entry"
                        name="entry"
                        ref={searchFieldRef}
                        type="text"
                        placeholder={t("translation:query")}
                        className="input input-bordered w-full"
                        autoComplete="off"
                        onKeyDown={handleKeyDown}
                    />

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={false}
                        onClick={handleSearch}
                    >
                        {t("translation:search")}
                    </button>

                    <div>
                        {words.map(word => (
                            <WordListEntry key={word.id}
                                           word={word}
                                           noEdit={true}
                                           draftCreate={true}
                                           createDraft={createDraftHandler}/>
                        ))}
                    </div>
                </div>

            </div>
            <form method="dialog" className="modal-backdrop">
                <button aria-label="Close backdrop"/>
            </form>
            <Loading isLoading={loading} />
        </dialog>
    )
}
export default QuickAddWordModal
