import { useEffect, useMemo, useState } from "react";
import {
    Bar,
    BarChart,
    Line,
    LineChart,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Temporal } from "@js-temporal/polyfill";
import { getAllStats } from "@/services/api/statsService";
import { Loader2 } from "lucide-react";
import {useTranslation} from "react-i18next";

interface ChartPoint {
    label: string;
    minutes: number;
}

interface CumulativePoint {
    date: string;
    cumulativeHours: number;
}

const durationToMinutes = (d: Temporal.Duration): number =>
    Number((d.hours * 60 + d.minutes + d.seconds / 60).toFixed(2));

export const Stats = () => {
    const {t} = useTranslation();
    const [loading, setLoading] = useState(true);
    const [allStats, setAllStats] = useState<Awaited<ReturnType<typeof getAllStats>> | null>(null);

    useEffect(() => {
        (async () => {
            const res = await getAllStats();
            setAllStats(res);
            setLoading(false);
        })();
    }, []);

    const today = Temporal.Now.plainDateISO();
    const {
        kanjiCount,
        wordsCount,
        totalDuration,
        totalExercises,
        stats: dailyStats,
    } = allStats ?? {
        kanjiCount: 0,
        wordsCount: 0,
        totalDuration: Temporal.Duration.from({ hours: 0 }),
        totalExercises: 0,
        stats: [],
    };

    const todayStats = useMemo(
        () => dailyStats.find((s) => Temporal.PlainDate.compare(s.date, today) === 0),
        [dailyStats, today]
    );
    const timeTodayMinutes = todayStats ? durationToMinutes(todayStats.duration) : 0;
    const exercisesToday = todayStats ? todayStats.exercises : 0;

    const weekdayLabels = [t("translation:sunday"), t("translation:monday"),
        t("translation:tuesday"),t("translation:wednesday"),t("translation:thursday"),
        t("translation:friday"),t("translation:saturday")];
    const last7Days = useMemo(() => {
        const arr: ChartPoint[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = today.subtract({ days: i });
            const stat = dailyStats.find((s) => Temporal.PlainDate.compare(s.date, d) === 0);
            const minutes = stat ? durationToMinutes(stat.duration) : 0;
            arr.push({ label: weekdayLabels[d.dayOfWeek % 7], minutes });
        }
        return arr;
    }, [dailyStats, today]);

    const cumulative30Data: CumulativePoint[] = useMemo(() => {
        const points: { date: string; minutes: number }[] = [];
        for (let i = 29; i >= 0; i--) {
            const d = today.subtract({ days: i });
            const stat = dailyStats.find((s) => Temporal.PlainDate.compare(s.date, d) === 0);
            const minutes = stat ? durationToMinutes(stat.duration) : 0;
            points.push({
                date: `${d.month.toString().padStart(2, "0")}/${d.day.toString().padStart(2, "0")}`,
                minutes,
            });
        }

        let cumMinutes = 0;
        return points.map(({ date, minutes }) => {
            cumMinutes += minutes;
            return { date, cumulativeHours: +(cumMinutes / 60).toFixed(2) };
        });
    }, [dailyStats, today]);

    const minutesToString = (minutesTotal: number): string => {
        const hours = Math.floor(minutesTotal / 60);
        const minutes = Math.floor(minutesTotal % 60);
        return `${hours}${t("translation:hoursShort")} ${minutes.toString().padStart(2, "0")}${t("translation:minutesShort")}`;
    };

    if (loading) {
        return (
            <div className="flex flex-1 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    const tooltipProps = {
        wrapperStyle: {
            backgroundColor: "var(--color-base-300)",
            border: "1px solid var(--color-base-100)",
            borderRadius: "0.5rem",
            overflow: "hidden",
        },
        contentStyle: {
            backgroundColor: "transparent",
            boxShadow: "none",
            border: "inherit",
            borderRadius: "inherit",
        },
        labelStyle: { color: "var(--color-base-content)" },
        itemStyle: { color: "var(--color-base-content)" },
    };

    return (
        <div className="mx-auto max-w-6xl space-y-8 lg:pt-4 pt-12 max-h-[80vh] overflow-y-auto scrollbar-hide">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                <OverviewCard title={t("translation:totalKanji")} value={kanjiCount.toLocaleString()} />
                <OverviewCard title={t("translation:totalWords")} value={wordsCount.toLocaleString()} />
                <OverviewCard title={t("translation:timeToday")} value={minutesToString(timeTodayMinutes)} />
                <OverviewCard title={t("translation:timeTotal")} value={minutesToString(durationToMinutes(totalDuration))} />
                <OverviewCard title={t("translation:exercisesToday")} value={exercisesToday.toString()} />
                <OverviewCard title={t("translation:exercisesTotal")} value={totalExercises.toString()} />
            </div>

            <div className="grid grid-cols-1 gap-8">
                <div className="card bg-base-100 shadow h-80">
                    <div className="card-body p-4">
                        <h2 className="mb-2 text-lg font-semibold">{t("translation:studyTimeLast7")}</h2>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={last7Days} margin={{ left: -20 }}>
                                <XAxis dataKey="label" />
                                <YAxis />
                                <Tooltip
                                    wrapperStyle={tooltipProps.wrapperStyle}
                                    contentStyle={tooltipProps.contentStyle}
                                    labelStyle={tooltipProps.labelStyle}
                                    itemStyle={tooltipProps.itemStyle}
                                    formatter={(value: number) => [`${value}`, t("translation:minutes")]}
                                />
                                <Bar dataKey="minutes" className="fill-primary" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="card bg-base-100 shadow h-80">
                    <div className="card-body p-4">
                        <h2 className="mb-2 text-lg font-semibold">{t("translation:cumStudyTime30")}</h2>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={cumulative30Data} margin={{ left: -20 }}>
                                <XAxis dataKey="date" />
                                <YAxis
                                    label={{ value: "Stunden", angle: -90, position: "insideLeft", dx: -6 }}
                                />
                                <Tooltip
                                    wrapperStyle={tooltipProps.wrapperStyle}
                                    contentStyle={tooltipProps.contentStyle}
                                    labelStyle={tooltipProps.labelStyle}
                                    itemStyle={tooltipProps.itemStyle}
                                    formatter={(value: number) => [`${value}${t("translation:hoursShort")}`, t("translation:cumulativeHours")]}
                                />
                                <Line type="monotone" stroke="var(--color-primary)" dataKey="cumulativeHours" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stats;

interface OverviewCardProps {
    title: string;
    value: string;
}
const OverviewCard = ({ title, value }: OverviewCardProps) => (
    <div className="card bg-base-100 shadow">
        <div className="card-body flex flex-col items-center justify-center p-4">
            <span className="text-sm text-gray-500">{title}</span>
            <span className="text-2xl font-bold">{value}</span>
        </div>
    </div>
);