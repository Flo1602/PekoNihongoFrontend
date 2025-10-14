import {useMemo} from "react";
import {Temporal} from "@js-temporal/polyfill";
import type {Stats} from "@/services/api/statsService.ts";
import BackArrowIcon from "@/assets/icons/BackArrowIcon.tsx";
import {useIsMobile} from "@/hooks/useIdMobile.ts";
import {useTranslation} from "react-i18next";

interface StreakCalendarProps {
    stats: Stats[];
    month: Temporal.PlainYearMonth;
    onChangeMonth: (m: Temporal.PlainYearMonth) => void;
    /** Optional: 1 = Montag (Default), 7 = Sonntag */
    firstDayOfWeek?: 1 | 7;
}

export const StreakCalendar: React.FC<StreakCalendarProps> = ({
                                                                  stats,
                                                                  month,
                                                                  onChangeMonth,
                                                                  firstDayOfWeek = 1,
                                                              }) => {
    const {t, i18n} = useTranslation();
    const today = Temporal.Now.plainDateISO();
    const isMobile = useIsMobile();

    const weekdayLabels = [t("translation:sunday"), t("translation:monday"),
        t("translation:tuesday"),t("translation:wednesday"),t("translation:thursday"),
        t("translation:friday"),t("translation:saturday")];

    function formatMonthTitle(m: Temporal.PlainYearMonth, longForm: boolean) {
        // einfache deutschsprachige Anzeige, z.B. "Oktober 2025"
        const d = Temporal.PlainDate.from({ year: m.year, month: m.month, day: 1 });
        const formatter = new Intl.DateTimeFormat(i18n.language, { month: (longForm)? "long":"short", year: "numeric" });
        return formatter.format(new Date(d.year, d.month - 1, 1));
    }

    const firstOfMonth = useMemo(
        () => Temporal.PlainDate.from({ year: month.year, month: month.month, day: 1 }),
        [month.year, month.month]
    );
    const daysInMonth = firstOfMonth.daysInMonth;

    // Map für schnellen Zugriff: "YYYY-MM-DD" -> Stats
    const statByDate = useMemo(() => {
        const map = new Map<string, Stats>();
        for (const s of stats) map.set(s.date.toString(), s);
        return map;
    }, [stats]);

    // Offset für den ersten Wochentag (Montag=1 … Sonntag=7)
    const offset = useMemo(() => {
        // 0..6: wie viele leere Felder vor dem 1. des Monats
        // Bsp (Mo-Start): (dayOfWeek - 1 + 7) % 7
        const dow = firstOfMonth.dayOfWeek; // 1..7 (Mo..So)
        const base = firstDayOfWeek === 1 ? 1 : 7;
        return (dow - base + 7) % 7;
    }, [firstOfMonth, firstDayOfWeek]);

    const totalCells = Math.ceil((offset + daysInMonth) / 7) * 7;

    const goPrevMonth = () => onChangeMonth(month.subtract({ months: 1 }));
    const goNextMonth = () => onChangeMonth(month.add({ months: 1 }));
    const goThisMonth = () => onChangeMonth(today.toPlainYearMonth());

    return (
        <div className="flex-1 card bg-base-200 shadow-xl max-w-md w-full">
            <div className="card-body p-4 sm:p-6">
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                    <div className="join">
                        <button className="btn btn-ghost btn-sm join-item" onClick={goPrevMonth} aria-label="Vorheriger Monat">
                            <BackArrowIcon className=""/>
                        </button>
                        <button className="btn btn-ghost btn-sm join-item" onClick={goThisMonth}>
                            {t("translation:today")}
                        </button>
                        <button className="btn btn-ghost btn-sm join-item" onClick={goNextMonth} aria-label="Nächster Monat">
                            <BackArrowIcon className="rotate-180"/>
                        </button>
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold">{formatMonthTitle(month, !isMobile)}</h2>
                </div>

                {/* Wochentage */}
                <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs sm:text-sm opacity-70">
                    {weekdayLabels.map((d) => (
                        <div key={d} className="py-1">{d}</div>
                    ))}
                </div>

                {/* Tage */}
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: totalCells }).map((_, i) => {
                        const dayNumber = i - offset + 1;
                        const inMonth = dayNumber >= 1 && dayNumber <= daysInMonth;

                        if (!inMonth) {
                            return (
                                <div
                                    key={`empty-${i}`}
                                    className="aspect-square rounded-xl bg-base-300/40"
                                    aria-hidden
                                />
                            );
                        }

                        const date = firstOfMonth.with({ day: dayNumber });
                        const key = date.toString();
                        const s = statByDate.get(key);

                        const isToday = date.equals(today);
                        const extended = s?.streak != null && s.streak > 0;

                        let tooltipText =
                            s
                                ? `${date.toString()} • ${t("translation:streak")}: ${s.streak}`
                                : date.toString();
                        if(isMobile){
                            tooltipText =date.toString();
                        }

                        const baseClasses =
                            "aspect-square rounded-xl flex items-center justify-center select-none transition hover:brightness-110";
                        const goldClasses =
                            "bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-black font-bold shadow";
                        const neutralClasses = "bg-base-300";
                        const ringToday = isToday ? "ring-2 ring-primary" : "";

                        return (
                            <div key={key} className="tooltip" data-tip={tooltipText}>
                                <div
                                    className={[
                                        baseClasses,
                                        extended ? goldClasses : neutralClasses,
                                        ringToday,
                                    ].join(" ")}
                                    aria-label={tooltipText}
                                >
                                    <span className="text-sm sm:text-base">{dayNumber}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Legende */}
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                        <span className="inline-block h-4 w-4 rounded bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 border border-amber-600" />
                        <span>{t("streakExtended")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="inline-block h-4 w-4 rounded bg-base-300 ring-2 ring-primary" />
                        <span>{t("translation:today")}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StreakCalendar;