import Loading from "@/components/Loading.tsx";
import {type ReactNode, useMemo} from "react";

interface Props{
    loading: boolean;
    pages: number;
    fetchPage: (page: number) => void;
    children: ReactNode;
    currentPage: number;
}

const CatalogList = ({loading, pages, fetchPage, children, currentPage}: Props) => {
    const pageList = useMemo<(number | string)[]>(() => {
        if (pages <= 1) return [];

        const list: (number | string)[] = [];
        const delta = 1;
        const range: number[] = [];

        for (
            let i = Math.max(0, currentPage - delta);
            i <= Math.min(pages - 1, currentPage + delta);
            i++
        ) {
            range.push(i);
        }

        if (range[0] > 0) {
            list.push(0);
            if (range[0] > 1) list.push("start-ellipsis");
        }

        list.push(...range);

        if (range[range.length - 1] < pages - 1) {
            if (range[range.length - 1] < pages - 2) list.push("end-ellipsis");
            list.push(pages - 1);
        }

        return list;
    }, [pages, currentPage]);

    const handleClick = (page: number) => {
        if (page !== currentPage) fetchPage(page);
    };

    return (
        <div className=" w-full
            max-w-md           /* phones / small tablets */
            md:max-w-2xl       /* ≥768 px  (tailwind md) */
            lg:max-w-3xl       /* ≥1024 px (tailwind lg) */
            mx-auto max-h-[60vh] lg:max-h-[66vh]"
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
                                    key={idx}
                                    onClick={() => handleClick(item as number)}
                                    className={`join-item btn btn-sm ${item === currentPage ? 'btn-active btn-primary' : ''}`}
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
