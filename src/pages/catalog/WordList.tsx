import {getWordPage, addWord, type Word, updateWord} from "@/services/api/wordService.ts";
import CatalogList from "@/components/catalog/CatalogList.tsx";
import {useCallback, useEffect, useState} from "react";
import WordListEntry from "@/components/catalog/WordListEntry.tsx";
import WordModal from "@/components/catalog/WordModal.tsx";
import {useSearchParams} from "react-router-dom";
import {useTranslation} from "react-i18next";
import CatalogSearchField from "@/components/catalog/CatalogSearchField.tsx";

const WordList = () => {
    const [words, setWords] = useState<Word[]>([])
    const [loading, setLoading] = useState(true)
    const [pages, setPages] = useState(0)
    const [editWord, setEditWord] = useState<Word>();
    const [searchParams, setSearchParams] = useSearchParams();
    const {t} = useTranslation();

    const pageParam = Number.parseInt(searchParams.get("page") ?? "1", 10);
    const currentPage = Math.max(0, (isFinite(pageParam) ? pageParam : 1) - 1);
    const searchParam = searchParams.get("search") || "";

    const [search, setSearch] = useState<string>(searchParam);

    useEffect(() => {
        setSearch(searchParam);
    }, [searchParam]);

    const fetchPageFromApi = useCallback((page: number, query: string) => {
        setLoading(true);
        getWordPage({ page: page, size: 20, search: query })
            .then((response) => {
                setWords(response.data.content);

                setPages(response.data.pageCount);

                if(page >= response.data.pageCount && response.data.pageCount > 0){
                    setSearchParams({ page: String(response.data.pageCount), search: query });
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [setSearchParams]);

    useEffect(() => {
        fetchPageFromApi(currentPage, search);
    }, [currentPage, search]);

    const goToPage = (page: number) => {
        setSearchParams({ page: String(page + 1), search });
    };

    const onSearchChange = (value: string) => {
        if(value === search) return;
        setSearchParams({ page: "1", search: value });
    };

    const refetchPage = () => {
        fetchPageFromApi(currentPage, search);
    };

    const addWordFetch = (formdata: Word) => {
        addWord(formdata).then(response => {
            const newWord = response.data;
            setWords(prev => [newWord, ...prev]);
        }).catch(console.error);
    }

    const editWordFetch = (formdata: Word) => {
        console.log(formdata);
        updateWord(formdata)
            .then(response => {
                const newWord = response.data;
                setWords(prev =>
                    prev.map(w => w.id === newWord.id ? newWord : w)
                );
            })
            .catch(console.error);
    };

    const openAddWordModal = () => {
        (document.getElementById('addWordModal') as HTMLDialogElement)?.showModal();
    }

    const openEditWordModal = (word: Word) => {
        setEditWord(word);
        (document.getElementById('editWordModal') as HTMLDialogElement)?.showModal();
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
                    <h1 className="text-lg font-semibold">{t("translation:wordCatalog")}</h1>
                    <div className="flex items-center justify-between mt-3 gap-8">
                        <CatalogSearchField defaultSearch={search} setSearchDebounced={onSearchChange}/>

                        <button
                            onClick={openAddWordModal}
                            className="btn btn-primary btn-sm md:btn-md"
                        >
                            + {t("translation:addWord")}
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
                        <WordListEntry key={word.id} word={word} refetechPage={refetchPage} openEditWordModal={openEditWordModal}/>
                    ))}
                </CatalogList>
            </div>

            <WordModal
                elementId="addWordModal"
                onSubmitHandler={addWordFetch}
                title={t("translation:addWord")}
            />
            <WordModal
                elementId="editWordModal"
                onSubmitHandler={editWordFetch}
                title={t("translation:editWord")}
                word={editWord}
            />
        </section>
    );
}
export default WordList