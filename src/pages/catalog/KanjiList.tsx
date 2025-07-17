import CatalogList from "@/components/catalog/CatalogList.tsx";
import KanjiListEntry from "@/components/catalog/KanjiListEntry.tsx";
import {useTranslation} from "react-i18next";
import {useCallback, useEffect, useState} from "react";
import {getKanjiPage, type KanjiWords} from "@/services/api/kanjiService.ts";
import {useSearchParams} from "react-router-dom";

const KanjiList = () => {
    const [kanji, setKanji] = useState<KanjiWords[]>([])
    const [loading, setLoading] = useState(true)
    const [pages, setPages] = useState(0)
    const [searchParams, setSearchParams] = useSearchParams();
    const {t} = useTranslation();

    const currentPage = parseInt(searchParams.get("page") ?? "0", 10);

    const fetchPageFromApi = useCallback((page: number) => {
        setLoading(true);
        getKanjiPage({ page: page, size: 20 })
            .then((response) => {
                setKanji(response.data.content);
                setPages(response.data.pageCount);

                if(page >= response.data.pageCount && response.data.pageCount > 0){
                    setSearchParams({ page: String(response.data.pageCount - 1) });
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [setSearchParams]);

    useEffect(() => {
        fetchPageFromApi(currentPage);
    }, [currentPage, fetchPageFromApi]);

    const goToPage = (page: number) => {
        setSearchParams({ page: String(page) });
    };

    const refetchPage = () => {
        fetchPageFromApi(currentPage);
    };

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

                <header className="flex items-center justify-between">
                    <h1 className="text-lg font-semibold">{t("translation:kanjiCatalog")}</h1>
                </header>

                <CatalogList
                    loading={loading}
                    pages={pages}
                    fetchPage={goToPage}
                >
                    {kanji.map(kanjiEntry => (
                        <KanjiListEntry key={kanjiEntry.id} kanji={kanjiEntry} refetechPage={refetchPage}/>
                    ))}
                </CatalogList>
            </div>
        </section>
    );
}
export default KanjiList
