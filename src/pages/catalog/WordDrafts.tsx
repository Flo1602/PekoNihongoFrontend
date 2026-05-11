import {type ChangeEvent, useCallback, useEffect, useState} from "react";
import {type Word} from "@/services/api/wordService.ts";
import {useSearchParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import CatalogList from "@/components/catalog/CatalogList.tsx";
import WordListEntry from "@/components/catalog/WordListEntry.tsx";
import WordModal from "@/components/catalog/WordModal.tsx";
import {
    addWordDraft,
    deleteWordDraft,
    getWordDraftPage, getWordInfo,
    setActiveVocab,
    updateWordDraft, type WordInfo
} from "@/services/api/wordDraftService.ts";
import QuickAddWordModal from "@/components/catalog/QuickAddWordModal.tsx";
import WordInfoCard from "@/components/catalog/WordInfoCard.tsx";

const WordDrafts = () => {
    const [words, setWords] = useState<Word[]>([]);
    const [wordInfo, setWordInfo] = useState<Map<number, WordInfo>>(
        () => new Map()
    );
    const [loading, setLoading] = useState(true);
    const [pages, setPages] = useState(0);
    const [editWord, setEditWord] = useState<Word>();
    const [searchParams, setSearchParams] = useSearchParams();
    const {t} = useTranslation();

    const pageParam = Number.parseInt(searchParams.get("page") ?? "1", 10);
    const currentPage = Math.max(0, (isFinite(pageParam) ? pageParam : 1) - 1);

    const fetchPageFromApi = useCallback((page: number) => {
        setLoading(true);
        getWordDraftPage({ page: page, size: 20 })
            .then((response) => {
                setWords(response.data.content);

                setPages(response.data.pageCount);

                if(page >= response.data.pageCount && response.data.pageCount > 0){
                    setSearchParams({ page: String(response.data.pageCount) });
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [setSearchParams]);

    const fetchWordInfo = (wordDraftId: number) => {
        getWordInfo(wordDraftId).then((response) => {
            setWordInfo(prev => {
                const next = new Map(prev);
                next.set(wordDraftId, response.data);
                return next;
            });
        }).catch(console.error);
    }

    useEffect(() => {
        fetchPageFromApi(currentPage);
    }, [currentPage]);

    const goToPage = (page: number) => {
        setSearchParams({ page: String(page + 1) });
    };

    const refetchPage = () => {
        fetchPageFromApi(currentPage);
    };

    const addWordDraftFetch = (formdata: Word) => {
        addWordDraft(formdata).then(response => {
            const newWord = response.data;
            setWords(prev => [newWord, ...prev]);
        }).catch(console.error);
    }

    const editWordDraftFetch = (formdata: Word) => {
        updateWordDraft(formdata)
            .then(response => {
                const newWord = response.data;
                setWords(prev =>
                    prev.map(w => w.id === newWord.id ? newWord : w)
                );
            })
            .catch(console.error);
    };

    const deleteWordDraftFetch = (id: number) => {
        deleteWordDraft(id).then((res) => {
            if(res.data === true){
                refetchPage();
            }
        }).catch(console.error);
    }

    const activateWordDraftFetch = (id: number) => {
        setActiveVocab(id).then((res) => {
            if(res.data === true){
                refetchPage();
            } else {
                window.alert(
                    t("draftActivateError")
                );
            }
        }).catch(console.error);
    }

    const openAddWordModal = () => {
        (document.getElementById('addWordModal') as HTMLDialogElement)?.showModal();
    }

    const openEditWordModal = (word: Word) => {
        setEditWord(word);
        (document.getElementById('editWordModal') as HTMLDialogElement)?.showModal();
    }

    const openQuickAddModal = () => {
        (document.getElementById('quickAddModal') as HTMLDialogElement)?.showModal();
    }

    const openCollapse = (e: ChangeEvent<HTMLInputElement>) => {
        if(e.target.checked){
            fetchWordInfo(Number(e.target.id));
        }
    }

    return (
        <section className="flex-1 bg-base-300 py-10 flex justify-center">
            <div
                className="
                  w-full px-4     /* horizontal breathing room */
                  max-w-md        /* phones */
                  md:max-w-2xl    /* tablets / small desktop */
                  lg:max-w-3xl    /* big desktop */
                  flex flex-col gap-4"
            >

                <header className="flex flex-col">
                    <h1 className="text-lg font-semibold">{t("wordDrafts")}</h1>
                    <div className="flex items-center justify-between mt-3 gap-8">
                        <button
                            onClick={openAddWordModal}
                            className="btn btn-primary btn-sm md:btn-md"
                        >
                            {t("addWord")}
                        </button>
                        <button
                            onClick={openQuickAddModal}
                            className="btn btn-primary btn-sm md:btn-md"
                        >
                            {t("quickAdd")}
                        </button>
                    </div>
                </header>

                <CatalogList
                    loading={loading}
                    pages={pages}
                    fetchPage={goToPage}
                    currentPage={currentPage}
                >
                    {words.map(word => (
                        <div key={word.id} tabIndex={word.id} className="collapse overflow-visible">
                            <input id={word.id.toString()} type="checkbox" className="peer" onChange={openCollapse}/>
                            <div className={"collapse-title p-0 pe-0 md:overflow-x-visible" + (word.kana.length > 6 ? " overflow-x-hidden":"")}>
                                <WordListEntry key={word.id}
                                               word={word}
                                               openEditWordModal={openEditWordModal}
                                               deleteWordFetch={deleteWordDraftFetch}
                                               draft={true}
                                               activateWordDraftFetch={activateWordDraftFetch}/>
                            </div>
                            <div className="collapse-content overflow-hidden">
                                <WordInfoCard info={wordInfo.get(word.id)}/>
                            </div>
                        </div>
                    ))}
                </CatalogList>
            </div>

            <WordModal
                elementId="addWordModal"
                onSubmitHandler={addWordDraftFetch}
                title={t("addWord")}
                draft={true}
            />
            <WordModal
                elementId="editWordModal"
                onSubmitHandler={editWordDraftFetch}
                title={t("editWord")}
                word={editWord}
                draft={true}
            />
            <QuickAddWordModal elementId={"quickAddModal"} createDraft={addWordDraftFetch}/>
        </section>
    );
}
export default WordDrafts
