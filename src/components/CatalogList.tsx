interface Props{
    loading: boolean;
    pages: number;
    fetchPage: (page: number) => void;
    children: React.ReactNode;
}

const CatalogList = ({loading, pages, fetchPage, children}: Props) => {

    return (
        <div className=" w-full
            max-w-md           /* phones / small tablets */
            md:max-w-2xl       /* ≥768 px  (tailwind md) */
            lg:max-w-3xl       /* ≥1024 px (tailwind lg) */
            mx-auto"
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
                        {Array.from({ length: pages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => fetchPage(i)}
                                className="join-item btn btn-sm"
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </nav>
            )}

            {loading && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
                    <span className="loading loading-spinner loading-xl text-white"></span>
                </div>
            )}
        </div>
    );
}
export default CatalogList
