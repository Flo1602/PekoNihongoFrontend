import {Temporal} from "@js-temporal/polyfill";
import {useEffect, useState} from "react";

interface Props {
    target: Temporal.PlainDateTime;
    countdownEndHandler?: () => void;
}

const Countdown = ({target, countdownEndHandler}: Props) => {
    const [remaining, setRemaining] = useState<string>("");

    const updateRemeining = (diff: Temporal.Duration) =>{
        const totalSeconds = diff.total("seconds");
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = Math.floor(totalSeconds % 60);

        const formatted = [
            hours.toString().padStart(2, "0"),
            minutes.toString().padStart(2, "0"),
            seconds.toString().padStart(2, "0"),
        ].join(":");

        setRemaining(formatted);
    }

    useEffect(() => {
        if(!target){
            return;
        }

        updateRemeining(target.since(Temporal.Now.plainDateTimeISO(), { largestUnit: "seconds" }));

        const interval = setInterval(() => {
            const now = Temporal.Now.plainDateTimeISO();
            const diff = target.since(now, { largestUnit: "seconds" });

            // Wenn Zielzeit erreicht oder überschritten → 0
            if (diff.total("seconds") <= 0) {
                setRemaining("00:00:00");
                clearInterval(interval);
                if (countdownEndHandler) {
                    countdownEndHandler();
                }
                return;
            }

            updateRemeining(diff);
        }, 1000);

        return () => clearInterval(interval);
    }, [target]);

    return (
        <span className="text-3xl font-mono font-bold text-primary mt-1">
            {remaining}
        </span>
    );
}
export default Countdown
