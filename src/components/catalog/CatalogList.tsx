import Loading from "@/components/Loading.tsx";
import {useEffect, useState} from "react";

interface Props{
    loading: boolean;
    pages: number;
    fetchPage: (page: number) => void;
    children: React.ReactNode;
}

const CatalogList = ({loading, pages, fetchPage, children}: Props) => {
    const [currentPage, setCurrentPage] = useState<number>(0);

    useEffect(() => {
        if (currentPage >= pages) {
            setCurrentPage(pages - 1);
        }
    }, [pages, currentPage]);

    const handleClick = (page: number) => {
        setCurrentPage(page);
        fetchPage(page);
    };

    const getPageList = (): (number | string)[] => {
        const pageList: (number | string)[] = [];
        const delta = 1;
        const range: number[] = [];

        for (let i = Math.max(0, currentPage - delta); i <= Math.min(pages - 1, currentPage + delta); i++) {
            range.push(i);
        }

        if (range[0] > 0) {
            pageList.push(0);
            if (range[0] > 1) {
                pageList.push("start-ellipsis");
            }
        }

        range.forEach(i => pageList.push(i));

        if (range[range.length - 1] < pages - 1) {
            if (range[range.length - 1] < pages - 2) {
                pageList.push("end-ellipsis");
            }
            pageList.push(pages - 1);
        }

        return pageList;
    };

    const pageList = getPageList();

    return (
        <div className=" w-full
            max-w-md           /* phones / small tablets */
            md:max-w-2xl       /* ≥768 px  (tailwind md) */
            lg:max-w-3xl       /* ≥1024 px (tailwind lg) */
            mx-auto max-h-[68vh]"
        >
            <ul className="
                flex flex-col gap-2
                p-4
                bg-base-200/60 rounded-xl shadow-lg
                overflow-auto scrollbar-thin
                w-full h-full"
            >
                {children}
            </ul>

            {pages > 1 && (
                <nav className="mt-4 flex justify-center">
                    <div className="join">
                        {pageList.map((item, idx) => {
                            if (typeof item === 'string') {
                                return (
                                    <span key={`${item}-${idx}`} className="join-item btn btn-disabled btn-sm">…</span>
                                );
                            }
                            return (
                                <button
                                    key={item}
                                    onClick={() => handleClick(item as number)}
                                    className={`join-item btn btn-sm ${item === currentPage ? 'btn-active' : ''}`}
                                >
                                    {item + 1}
                                </button>
                            );
                        })}
                    </div>
                </nav>
            )}

            <Loading isLoading={loading} />
        </div>
    );
}
export default CatalogList
