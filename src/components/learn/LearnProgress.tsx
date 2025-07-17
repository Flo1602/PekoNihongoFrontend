import { motion } from 'framer-motion';
import {useEffect, useRef} from "react";

interface Props {
    dueToday: number;
    completedToday: number;
    totalPending: number;
    label: string;
}

const LearnProgress = ({dueToday, completedToday, totalPending, label}: Props) => {
    const percent = dueToday > 0 ? (completedToday / dueToday) * 100 : 0;

    const storageKey = `learn-progress-${label}`;
    const today = new Date().toISOString().split('T')[0];

    function getPrev(storageKey: string): number {
        if (typeof window === 'undefined') {
            return 0;
        }
        try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
                const { date, percent: savedPercent } = JSON.parse(raw) as { date: string; percent: number };
                if (date === today && !isNaN(savedPercent)) {
                    return savedPercent;
                }
            }
        } catch { /* empty */ }
        return 0;
    }

    const initialPrevRef = useRef<number>(getPrev(storageKey));

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify({ date: today, percent }));
    }, [percent, storageKey, today]);

    return (
        <div className="w-full max-w-md mx-auto p-4">
            {/* Kopfzeile */}
            <div className="flex justify-between items-baseline mb-1">
        <span className="font-semibold">
          {label}{label.endsWith('s') ? '' : 's'} today
        </span>
                <span className="text-sm">
          {completedToday}/{dueToday}
        </span>
            </div>

            <div
                className="relative h-4 rounded-lg bg-primary/20 overflow-hidden"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={dueToday}
                aria-valuenow={completedToday}
                aria-label={`${completedToday} von ${dueToday} ${label} erledigt`}
            >
                <motion.div
                    className="absolute top-0 left-0 h-full bg-primary"
                    initial={{ width: `${initialPrevRef.current}%` }} // ← korrekter Startwert
                    animate={{ width: `${percent}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
            </div>

            <div className="text-xs text-right mt-1 opacity-80">
                {totalPending.toLocaleString()} pending overall
            </div>
        </div>
    );
}
export default LearnProgress
