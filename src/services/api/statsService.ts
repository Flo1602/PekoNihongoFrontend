import {api} from "@/services/api/client.ts";
import {Temporal} from '@js-temporal/polyfill';

export interface Stats{
    date: Temporal.PlainDate;
    duration: Temporal.Duration;
    exercises: number;
    streak: number;
}

interface StatRaw {
    date: string;
    duration: string;
    exercises: number;
    streak: number;
}

export interface AllStats {
    kanjiCount: number;
    wordsCount: number;
    totalDuration: Temporal.Duration;
    totalExercises: number;
    stats: Stats[];
}

interface AllStatsRaw {
    kanjiCount: number;
    wordsCount: number;
    totalDuration: string;
    totalExercises: number;
    stats: StatRaw[];
}


export async function saveStat(duration: Temporal.Duration) {
    const payload: StatRaw = {
        date: '',
        duration: duration.toString(),
        exercises: -1,
        streak: -1,
    };

    return api.post<StatRaw>('/stats', payload);
}

export async function getAllStats(): Promise<AllStats> {
    const { data } = await api.get<AllStatsRaw>("/stats", {
        params: { count: 30 },
    });

    return {
        kanjiCount: data.kanjiCount,
        wordsCount: data.wordsCount,
        totalDuration: Temporal.Duration.from(data.totalDuration),
        totalExercises: data.totalExercises,
        stats: data.stats.map<Stats>((s) => ({
            date: Temporal.PlainDate.from(s.date),
            duration: Temporal.Duration.from(s.duration),
            exercises: s.exercises,
            streak: s.streak,
        })),
    };
}

export async function getStatsBetween(from: Temporal.PlainDate, to: Temporal.PlainDate): Promise<Stats[]> {
    const {data} = await api.get<StatRaw[]>("/stats/between", {
        params: {startDate: from.toString(), endDate: to.toString()},
    });

    return data.map<Stats>((s) => ({
        date: Temporal.PlainDate.from(s.date),
        duration: Temporal.Duration.from(s.duration),
        exercises: s.exercises,
        streak: s.streak,
    }));
}