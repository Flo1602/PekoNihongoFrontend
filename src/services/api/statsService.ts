import {api} from "@/services/api/client.ts";
import { Temporal } from '@js-temporal/polyfill';

export interface Stats{
    date: Date;
    duration: Temporal.Duration;
    exercises: number;
}

interface StatRaw {
    date: string;
    duration: string;
    exercises: number;
}

export async function saveStat(duration: Temporal.Duration) {
    const payload: StatRaw = {
        date: '',
        duration: duration.toString(),
        exercises: -1,
    };

    return api.post<StatRaw>('/stats', payload);
}