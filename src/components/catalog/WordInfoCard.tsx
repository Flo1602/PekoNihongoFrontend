import type { WordInfo } from "@/services/api/wordDraftService.ts";
import { ExternalLink, CheckCircle2, Circle } from "lucide-react";
import {useTranslation} from "react-i18next";

interface Props {
    info?: WordInfo;
}

const SKELETON_KANJI = 3; // Platzhalter-Kanji für Höhe/Stabilität

const WordInfoCard = ({ info }: Props) => {
    const {t} = useTranslation();
    const loading = !info;

    if (loading) {
        return (
            <div
                className="card bg-base-200 shadow-xl border border-base-300 mt-1"
                aria-busy="true"
                aria-live="polite"
            >
                <div className="card-body gap-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 w-full">
                            <div className="skeleton h-7 w-48 rounded"></div>
                            <div className="mt-2 flex items-center gap-2">
                                <div className="skeleton h-6 w-20 rounded-full"></div>
                                <div className="skeleton h-6 w-12 rounded-full"></div>
                            </div>
                        </div>
                        <button className="btn btn-ghost btn-sm gap-2" disabled>
                            <span className="loading loading-spinner loading-sm" aria-hidden="true" />
                            <span className="hidden sm:inline">{t("translation:loading")}…</span>
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="skeleton h-4 w-64 rounded-full"></div>
                        <div className="skeleton h-4 w-24 rounded"></div>
                    </div>

                    <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                        {Array.from({ length: SKELETON_KANJI }).map((_, i) => (
                            <div key={i} className="skeleton h-10 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const total = info.kanjiInfos?.length ?? 0;
    const learnedCount = info.kanjiInfos?.filter(k => k.learned).length ?? 0;

    return (
        <div className="card bg-base-200 shadow-xl border border-base-300 mt-1">
            <div className="card-body gap-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h2 className="card-title text-2xl tracking-tight break-words">
                            {info.word}
                        </h2>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="badge badge-primary badge-lg">
                                {info.jlptInfo || "JLPT —"}
                             </span>
                            <span className="badge">{total} 字</span>
                        </div>
                    </div>

                    <a
                        href={info.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm gap-2"
                        aria-label="Externer Wörterbuch-Link"
                        title="Externer Wörterbuch-Link"
                    >
                        <ExternalLink className="w-4 h-4" />
                        <span className="hidden sm:inline">{t("translation:open")}</span>
                    </a>
                </div>

                <div className="flex items-center gap-4">
                    <progress
                        className="progress progress-primary w-48 sm:w-64"
                        value={learnedCount}
                        max={Math.max(total, 1)}
                    />
                    <span className="text-sm opacity-70">
                        {learnedCount} / {total} {t("translation:learned")}
                    </span>
                </div>

                {total > 0 ? (
                    <div
                        className="grid grid-cols-5 sm:grid-cols-8 gap-2"
                        aria-label="Kanji-Übersicht"
                    >
                        {info.kanjiInfos!.map((k, i) => (
                            <KanjiChip k={k} key={`${k.symbol}-${i}`} />
                        ))}
                    </div>
                ) : (
                    <p className="opacity-70">{t("translation:noKanjiInfo")}</p>
                )}
            </div>
        </div>
    );
};

type Kanji = WordInfo["kanjiInfos"][number];

const KanjiChip = ({ k }: { k: Kanji }) => {
    const learned = k.learned;
    const tooltip = `${k.jlptInfo || "-"}`;

    const searchWordsWithKanji = () => {
        if(learned){
            window.open("/catalog/words?search=" + k.symbol, "_blank");
        }
    }

    return (
        <div className="tooltip" data-tip={tooltip} onContextMenu={(e) => {e.preventDefault(); searchWordsWithKanji();}}>
            <div
                className={[
                    "flex items-center justify-between gap-1 px-2 h-10 rounded-xl border",
                    "transition-colors select-none",
                    learned
                        ? "bg-success/15 border-success/50"
                        : "bg-base-100 border-base-content/20",
                    "hover:brightness-105",
                ].join(" ")}
                aria-label={`${k.symbol} ${tooltip}${learned ? " (gelernt)" : ""}`}
            >
                <span className="text-lg font-bold leading-none">{k.symbol}</span>
                {learned ? (
                    <CheckCircle2 className="w-4 h-4 text-success" aria-hidden="true" />
                ) : (
                    <Circle className="w-4 h-4 opacity-60" aria-hidden="true" />
                )}
            </div>
        </div>
    );
};

export default WordInfoCard;
