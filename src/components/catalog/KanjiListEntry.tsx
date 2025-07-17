import {deleteKanji, type KanjiWords} from "@/services/api/kanjiService.ts";
import {useTranslation} from "react-i18next";
import DeleteIcon from "@/assets/icons/DeleteIcon.tsx";

interface Props {
    kanji: KanjiWords;
    refetechPage: () => void;
}

const KanjiListEntry = ({ kanji, refetechPage }: Props) => {

    const {t} = useTranslation();

    const deleteHandler = () => {
        deleteKanji(kanji.id).then((res) => {
                if(res.data === true){
                    refetechPage();
                }
            }
        )
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
            <div className="flex min-w-0 items-center gap-3">
                <span className="font-medium text-3xl leading-tight">
                    {kanji.symbol}
                </span>

                <span className="text-sm uppercase tracking-widest opacity-60">
                    {kanji.words.join(', ')}
                </span>
            </div>

            <div className="flex shrink-0 gap-5">

                { kanji.words.length === 0 && (<button
                    aria-label="Delete word"
                    className="btn btn-circle btn-ghost btn-xs tooltip text-error"
                    data-tip={t("translation:delete")}
                    onClick={deleteHandler}
                >
                    <DeleteIcon className="h-4 w-4"/>
                </button>)}

                <button
                    aria-label="Example sentence"
                    className="btn btn-ghost btn-sm tooltip btn-outline btn-info"
                >
                    {t("translation:words")}
                </button>
            </div>
        </li>
    )
}
export default KanjiListEntry
