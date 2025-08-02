import {useEffect, useState} from "react";
import {getWordPageKanjiFilter, type Word} from "@/services/api/wordService.ts";
import WordListEntry from "@/components/catalog/WordListEntry.tsx";
import CatalogList from "@/components/catalog/CatalogList.tsx";
import FilterIcon from "@/assets/icons/FilterIcon.tsx";
import {useTranslation} from "react-i18next";

interface Props {
    elementId: string;
    kanji: string[] | null;
}

const KanjiInfoModal = ({elementId, kanji}: Props) => {
    const [words, setWords] = useState<Word[]>([]);
    const [pages, setPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedKanji, setSelectedKanji] = useState<boolean[]>([]);
    const {t} = useTranslation();

    useEffect(() => {
        if(!kanji || kanji.length == 0) return;

        let filter: string = "";

        for(let i = 0; i < kanji.length; i++){
            if(selectedKanji[i]){
                filter += kanji[i];
            }
        }

        if(filter.length == 0){
            setWords([]);
            setPages(0);
            return;
        }

        getWordPageKanjiFilter({ page: currentPage, size: 10, search: filter })
            .then((response) => {
                setWords(response.data.content);
                setPages(response.data.pageCount);
            })
            .catch(console.error);
    }, [currentPage, selectedKanji]);

    useEffect(() => {
        if(!kanji || kanji.length == 0) return;
        setSelectedKanji(Array(kanji.length).fill(true));
        setCurrentPage(0);
    }, [kanji]);

    const goToPage = (page: number) => {
        setCurrentPage(page);
    };

    const toggleButton = (index: number) => {
        setSelectedKanji([...selectedKanji.slice(0, index), !selectedKanji[index], ...selectedKanji.slice(index + 1, selectedKanji.length)]);
        setCurrentPage(0);
    };

    return (
        <dialog
            id={elementId}
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

                <div className="pt-3">
                    <div className={"flex justify-center items-center gap-2 pb-3"}>
                        <div className="flex font-bold text-lg justify-center items-center pr-5"><FilterIcon className="h-8 w-8"/>:</div>
                        {
                            kanji?.map((kanji, index) => (
                                <button key={kanji}
                                        className={"btn btn-primary font-bold text-lg text-center " + (selectedKanji[index] ? "" : "btn-outline hover:bg-base-100!")}
                                        onClick={() => {toggleButton(index)}}>
                                    {kanji}
                                </button>
                            ))
                        }
                    </div>

                    {words.length === 0 ? <p className="h-[50vh] text-error text-center font-bold pt-5 pb-5">{t("translation:noWordsFound")}</p> :
                        <div className="h-[50vh] overflow-y-auto scrollbar-thin bg-base-200/60 rounded-xl shadow-lg">
                            <CatalogList
                                loading={false}
                                pages={pages}
                                fetchPage={goToPage}
                                currentPage={currentPage}
                                noCard={true}
                            >
                                {words.map(word => (
                                    <WordListEntry key={word.id} word={word} noEdit={true}/>
                                ))}
                            </CatalogList>
                        </div>

                    }
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button aria-label="Close backdrop"/>
            </form>
        </dialog>
    );
}
export default KanjiInfoModal
