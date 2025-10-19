import React, {useMemo, useState} from "react";
import {type Quest, type QuestType} from "@/services/api/questService.ts";
import {useTranslation} from "react-i18next";
import PenIcon from "@/assets/icons/PenIcon.tsx";
import DoubleCheckIcon from "@/assets/icons/DoubleCheckIcon.tsx";

interface Props {
    quest: Quest;
    className?: string;
    onDelete?: (id: number) => void;
    onEdit?: (quest: Quest) => void;
}

function clamp(v: number, min = 0, max = 100) {
    return Math.min(max, Math.max(min, v));
}

function getGoal(quest: Quest) {
    if(quest.type !== 'EXERCISE_TIME'){
        return Math.max(quest.goal, 1);
    }

    return Math.max(Math.round(quest.goal/60), 1);
}

function getProgress(quest: Quest) {
    if(quest.type !== 'EXERCISE_TIME'){
        return Math.max(quest.progress ?? 0, 0);
    }

    return Math.max(Math.floor(quest.progress / 60) ?? 0, 0);
}

export const QuestCard: React.FC<Props> = ({
                                               quest,
                                               className,
                                               onDelete,
                                               onEdit
                                           }) => {
    const {t} = useTranslation();

    const goal = getGoal(quest);
    const progress = getProgress(quest);
    const done = progress >= goal;

    const goalUnit = (quest.type === 'EXERCISE_TIME' ? t("translation:minutesShort") : "");

    const percent = clamp((progress / goal) * 100);

    // Titel (Typ nur als Titel für nicht-CUSTOM)
    const computedTitle = useMemo(() => {
        if (quest.type === "CUSTOM") {
            return quest.text?.trim() || "Custom";
        }
        // z.B. Keys: DAILY_WORDS, DAILY_KANJI, NEW_DRAFTS
        return t(quest.type);
    }, [quest, t]);

    // Inline-Edit Titel (nur CUSTOM)
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [tempTitle, setTempTitle] = useState(computedTitle);

    const startEditTitle = () => {
        if (quest.type !== "CUSTOM") return;
        setTempTitle(computedTitle);
        setIsEditingTitle(true);
    };
    const saveTitle = () => {
        quest.text = tempTitle.trim() || "Custom";
        onEdit?.(quest);
        setIsEditingTitle(false);
    };
    const cancelTitle = () => {
        setTempTitle(computedTitle);
        setIsEditingTitle(false);
    };

    // Inline-Edit Goal (nur NEW_DRAFTS)
    const [isEditingGoal, setIsEditingGoal] = useState(false);
    const [tempGoal, setTempGoal] = useState<number>(goal);

    const startEditGoal = () => {
        if (!canEditGoal(quest.type)) return;
        setTempGoal(goal);
        setIsEditingGoal(true);
    };
    const saveGoal = () => {
        quest.goal = Math.max(Number.isFinite(+tempGoal) ? Math.floor(+tempGoal) : 1, 1);

        if(quest.type === 'EXERCISE_TIME'){
            quest.goal *= 60;
        }

        onEdit?.(quest);
        setIsEditingGoal(false);
    };
    const cancelGoal = () => {
        setTempGoal(goal);
        setIsEditingGoal(false);
    };

    const onComplete = () => {
        quest.progress = quest.goal;
        onEdit?.(quest);
    };

    const canEditGoal = (type: QuestType) => {
        return type === "NEW_DRAFTS" || type === "EXERCISE_TIME" || type === "EXERCISE_COUNT";
    }

    return (
        <div
            className={`relative card bg-base-200 border ${done ? "border-success/40" : "border-base-300"} shadow-sm ${className ?? ""}`}
            aria-label={`Quest: ${computedTitle}`}
        >
            {onDelete &&
                <button
                    type="button"
                    className="btn btn-xs btn-circle btn-error absolute -right-2 -top-2"
                    aria-label={t("translation:delete")}
                    onClick={() => onDelete?.(quest.id)}
                    title={t("translation:delete")}
                >
                    ✕
                </button>
            }

            <div className="card-body gap-3 py-4">
                {/* Header */}
                <div className="flex items-center justify-between gap-3">
                    {/* Titel */}
                    <div className="flex min-w-0 items-center gap-2">
                        {(quest.type === "CUSTOM" && onEdit) ? (
                            isEditingTitle ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        className="input input-sm input-bordered bg-base-100"
                                        value={tempTitle}
                                        onChange={(e) => setTempTitle(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") saveTitle();
                                            if (e.key === "Escape") cancelTitle();
                                        }}
                                        autoFocus
                                    />
                                    <button className="btn btn-xs btn-success" onClick={saveTitle} title={t("translation:save")}>✓</button>
                                    <button className="btn btn-xs btn-ghost" onClick={cancelTitle} title={t("translation:cancel")}>✕</button>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-lg font-semibold leading-tight truncate">{computedTitle}</h3>
                                    <button
                                        className="btn btn-ghost btn-xs p-1"
                                        onClick={startEditTitle}
                                        aria-label={t("translation:editTitle")}
                                        title={t("translation:editTitle")}
                                    >
                                        <PenIcon className={"w-4 h-4"}/>
                                    </button>
                                </>
                            )
                        ) : (
                            <h3 className="text-lg font-semibold leading-tight truncate">{computedTitle}</h3>
                        )}
                    </div>

                    {/* Rechts: kompakte Actions + Prozent */}
                    <div className="flex items-center gap-2">
                        {(quest.type === "CUSTOM" && onEdit) && (
                            done ? (
                                <div className="tooltip tooltip-left" data-tip={t("translation:done")}>
                                    <button
                                        className="btn btn-xs btn-success btn-outline btn-disabled"
                                        aria-pressed="true"
                                        aria-label={t("translation:done")}
                                        disabled
                                    >
                                        <DoubleCheckIcon className={"w-4 h-4"}/>
                                    </button>
                                </div>
                            ) : (
                                <div className="tooltip tooltip-left" data-tip={t("translation:complete")}>
                                    <button
                                        className="btn btn-xs btn-success btn-outline"
                                        onClick={() => onComplete()}
                                        aria-pressed="false"
                                        aria-label={t("translation:complete")}
                                    >
                                        <DoubleCheckIcon className={"w-4 h-4"}/>
                                    </button>
                                </div>
                            )
                        )}

                        {/* kleiner Statuspunkt / Check als reiner Indikator bleibt optional */}
                        {done ? (
                            <span className="text-success" aria-hidden>✓</span>
                        ) : (
                            <span className="w-2 h-2 rounded-full bg-primary/80" aria-hidden />
                        )}

                        <span className="text-sm font-medium tabular-nums">{Math.round(percent)}%</span>
                    </div>
                </div>

                {/* Progressbar */}
                <progress
                    className={`progress w-full ${done ? "progress-success" : "progress-primary"}`}
                    value={percent}
                    max={100}
                    aria-valuenow={percent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />

                {/* Fußzeile */}
                <div className="flex items-center justify-between text-sm text-base-content/70">
                    {isEditingGoal ? (
                        <div className="flex items-center gap-2">
                            <span className="opacity-80">{progress}{goalUnit} /</span>
                            <input
                                type="number"
                                min={1}
                                className="input input-xs input-bordered w-20 bg-base-100"
                                value={tempGoal}
                                onChange={(e) => setTempGoal(parseInt(e.target.value || "1", 10))}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") saveGoal();
                                    if (e.key === "Escape") cancelGoal();
                                }}
                                autoFocus
                            />
                            <button className="btn btn-xs btn-success" onClick={saveGoal} title={t("translation:save")}>✓</button>
                            <button className="btn btn-xs btn-ghost" onClick={cancelGoal} title={t("translation:cancel")}>✕</button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="opacity-80">{progress}{goalUnit} / {goal}{goalUnit}</span>
                            {(canEditGoal(quest.type) && onEdit) && (
                                <button
                                    className="btn btn-ghost btn-xs p-1"
                                    onClick={startEditGoal}
                                    aria-label={t("translation:editGoal")}
                                    title={t("translation:editGoal")}
                                >
                                    <PenIcon className={"w-4 h-4"}/>
                                </button>
                            )}
                        </div>
                    )}
                    {(quest.expirationDate && !done) && (
                        <span className="opacity-80 text-error">{t("translation:expiration")}: {quest.expirationDate.toString()}</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuestCard;
