import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {saveStat} from "@/services/api/statsService.ts";
import { Temporal } from '@js-temporal/polyfill';
import {useTranslation} from "react-i18next";

interface Props{
    duration: number;
    correctness: number;
}

const formatDuration = (millis: number) => {
    const seconds = Math.floor(millis / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
};

const Result = ({ duration, correctness }: Props) => {
    const navigate = useNavigate();
    const {t} = useTranslation();
    const correctnessMotion = useMotionValue(0);
    const correctnessText = useTransform(correctnessMotion, v => `${Math.round(v)}%`);
    const barWidth = useTransform(correctnessMotion, v => `${v}%`);

    const durationMotion = useMotionValue(0);
    const durationText = useTransform(durationMotion, v => formatDuration(v));

    useEffect(() => {
        const c = animate(correctnessMotion, correctness, { duration: 1 });
        const d = animate(durationMotion, duration, { duration: 1 });
        return () => {
            c.stop();
            d.stop();
        };
    }, [correctness, duration, correctnessMotion, durationMotion]);

    useEffect(() => {
        saveStat(Temporal.Duration.from({ milliseconds: duration }));
    }, []);

    return (
        <motion.div
            className="flex flex-1 items-center justify-center bg-base-300 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <motion.div
                className="card w-full max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl bg-base-100 shadow-xl rounded-2xl"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 120 }}
            >
                <div className="card-body p-6 md:p-8 lg:p-10 text-center">
                    <motion.h1
                        className="text-xl md:text-3xl font-bold mb-6"
                        initial={{ scale: 0.85 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        🎉 {t("translation:sessionCompleted")} 🎉
                    </motion.h1>

                    <div className="mb-6 text-left">
                        <div className="flex justify-between mb-2">
                            <span className="font-medium">{t("translation:correctness")}</span>
                            <motion.span className="font-semibold" style={{ display: 'block' }}>
                                {correctnessText}
                            </motion.span>
                        </div>
                        <div className="w-full h-4 bg-primary/20 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-primary"
                                style={{ width: barWidth }}
                                transition={{ duration: 1, ease: 'easeInOut' }}
                            />
                        </div>
                    </div>

                    <div className="mb-8 text-left">
                        <span className="font-medium">{t("translation:duration")}:</span>
                        <motion.span className="ml-2 font-semibold inline-block">
                            {durationText}
                        </motion.span>
                    </div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <button onClick={() => navigate(-1)} className="btn btn-primary btn-lg w-full">{t("translation:finish")}</button>
                    </motion.div>
                </div>
            </motion.div>
        </motion.div>
    );
}
export default Result
