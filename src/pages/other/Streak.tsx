import {
    createDailyQuest,
    deleteQuest,
    getDailyQuests,
    type Quest,
    type QuestType,
    QuestTypes, updateQuest
} from "@/services/api/questService.ts";
import {useTranslation} from "react-i18next";
import {useEffect, useRef, useState} from "react";
import QuestCard from "@/components/other/QuestCard.tsx";
import StreakCalendar from "@/components/other/StreakCalendar.tsx";
import {getStatsBetween, type Stats} from "@/services/api/statsService.ts";
import {Temporal} from "@js-temporal/polyfill";
import {isEffectActive} from "@/services/api/effectService.ts";

const Streak = () => {
    const {t} = useTranslation();

    const [quests, setQuests] = useState<Quest[]>([]);
    const [streakStats, setStreakStats] = useState<Stats[]>([]);
    const [statsMonth, setStatsMonth] = useState<Temporal.PlainYearMonth>(Temporal.Now.plainDateISO().toPlainYearMonth());
    const [streakInfo, setStreakInfo] = useState<{currStreak: number, streakExtended: boolean}>({currStreak:0, streakExtended:false})
    const canEditQuests = useRef(false);
    const newQuestIds = useRef<number[]>([]);

    const currStreakCache = useRef<{currStreak: number, streakExtended: boolean}>({currStreak:0, streakExtended:false});

    useEffect(() => {
        isEffectActive('ALLOW_DAILY_QUESTS_EDIT').then(res =>{
            canEditQuests.current = res.data;

            refreshQuests();
        })
    }, []);

    useEffect(() => {
        refreshStreak();
    }, [statsMonth]);

    const createQuestHandler = (questType: QuestType): void =>{
        const quest: Quest = {
            id: 0,
            type: questType,
            category: 'DAILY_QUEST',
            text: "",
            goal: 1,
            progress: 0,
        }

        if(questType === 'EXERCISE_TIME'){
            quest.goal *= 60;
        }

        createDailyQuest(quest).then((res) =>{
            const quest: Quest = res.data;
            newQuestIds.current.push(quest.id);
            refreshQuestsAndStreak();
        });
    }

    const refreshQuestsAndStreak = (): void =>{
        refreshQuests();
        refreshStreak();
    }

    const refreshQuests = (): void =>{
        getDailyQuests().then(res =>{
            setQuests(res.data);
        });
    }

    const canEditQuest = (id: number):boolean => {
        return canEditQuests.current || newQuestIds.current.includes(id);
    }

    const refreshStreak = (): void =>{
        let firstDayOfMonth = statsMonth.toPlainDate({ day: 1 });
        const lastDayOfMonth = statsMonth.toPlainDate({ day: statsMonth.daysInMonth });

        if(firstDayOfMonth.equals(Temporal.Now.plainDateISO())){
            firstDayOfMonth = firstDayOfMonth.subtract({days: 1});
        }

        getStatsBetween(firstDayOfMonth.subtract({days: 1}), lastDayOfMonth).then(res =>{
            setStreakStats(res);

            if(Temporal.PlainDate.compare(Temporal.Now.plainDateISO(), lastDayOfMonth) > 0 || Temporal.PlainDate.compare(Temporal.Now.plainDateISO(), firstDayOfMonth) < 0){
                setStreakInfo(currStreakCache.current);
                return;
            }

            if(res.length === 0 || res.length === 1 && res[0].streak == null || !isDateToday(res[res.length-1].date)){
                setStreakInfo({
                    currStreak: 0,
                    streakExtended: false
                })
                return;
            } else if(res.length === 1){
                setStreakInfo({
                    currStreak: res[res.length-1].streak,
                    streakExtended: res[res.length-1].streak > 0
                })
            } else {
                let lastEntry = res[res.length-1];
                let extended = res[res.length-1].streak !== null && res[res.length-1].streak > 0;

                if(lastEntry.streak < 1 && isDateYesterday(res[res.length-2].date)){
                    lastEntry = res[res.length-2];
                    extended = false;
                }

                setStreakInfo({
                    currStreak: lastEntry.streak || 0,
                    streakExtended: extended
                })
            }
        })
    }

    useEffect(() => {
        currStreakCache.current = streakInfo;
    }, [streakInfo]);

    const isDateToday = (date: Temporal.PlainDate): boolean =>{
        const today = Temporal.Now.plainDateISO();
        return Temporal.PlainDate.compare(date, today) === 0;
    }
    const isDateYesterday = (date: Temporal.PlainDate): boolean =>{
        const today = Temporal.Now.plainDateISO();
        const yesterday = today.subtract({ days: 1 });
        return Temporal.PlainDate.compare(date, yesterday) === 0;
    }

    const deleteQuestHandler = (questId: number): void =>{
        deleteQuest(questId).then(() => refreshAfterUpdate());
    }

    const updateQuestHandler = (quest: Quest): void =>{
        updateQuest(quest).then(() => refreshAfterUpdate());
    }

    const refreshAfterUpdate = (): void =>{
        const currMonth = Temporal.Now.plainDateISO().toPlainYearMonth();
        if(statsMonth.equals(currMonth)){
            refreshQuestsAndStreak();
        } else {
            setStatsMonth(currMonth);
            refreshQuests();
        }
    }

    return (
        <div className="flex-1 bg-base-300 overflow-y-auto scrollbar-thin max-h-[90vh]">
            <div className="mx-auto w-full max-w-6xl px-4 md:px-6 py-8">
                <div className="flex items-center justify-center mb-6 md:mb-8">
                    <div className="stats bg-base-100 shadow-sm rounded-2xl w-full md:w-auto mx-auto">
                        <div className="stat flex items-center justify-center">
                            <div className="text-4xl md:text-5xl font-bold">{t("translation:streak")}: </div>
                            <div className={"stat-value text-4xl md:text-5xl text-primary " + (!streakInfo.streakExtended && "grayscale")}>{streakInfo?.currStreak}</div>
                            <div className={"stat-value text-4xl md:text-5xl " + (!streakInfo.streakExtended && "grayscale")}>🔥</div>
                        </div>
                    </div>
                </div>

                {/* Grid: mobil 1 Spalte, ab md 2 Spalten */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center pt-6">

                    {/* Kalender-Spalte */}
                    <div className="rounded-2xl shadow-sm flex lg:justify-end justify-center">
                        <StreakCalendar
                            stats={streakStats}
                            month={statsMonth}
                            onChangeMonth={setStatsMonth}
                        />
                    </div>

                    {/* Quests-Spalte */}
                    <div className="bg-base-100 rounded-2xl shadow-sm p-0 flex flex-col max-h-full md:max-h-[calc(100vh-20rem)]">
                        {/* Sticky Header innerhalb der Card */}
                        <div className="sticky top-0 z-10 bg-base-100/90 backdrop-blur supports-[backdrop-filter]:bg-base-100/70 border-b border-gray-700 rounded-t-2xl px-4 py-4 md:px-6 md:py-6  flex items-center justify-between">
                            <h2 className="text-lg sm:text-xl font-bold">{t("translation:dailyQuests")}</h2>

                            <div className="dropdown dropdown-end">
                                <button tabIndex={0} className="btn btn-primary btn-sm md:btn-md">
                                    {t("translation:create")}
                                </button>
                                <ul
                                    tabIndex={-1}
                                    className="dropdown-content menu bg-base-100 rounded-box z-[1] w-56 p-2 shadow"
                                >
                                    {QuestTypes.map((type) => (
                                        <li key={type}>
                                            <button onClick={() => createQuestHandler(type)} className="justify-start">
                                                {t(type)}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Quest-Liste */}
                        <div className="overflow-y-auto scrollbar-thin px-4 md:px-6 py-4 space-y-4">
                            {quests.length === 0 ? (
                                <div className="text-sm opacity-70 py-8 text-center">
                                    {t("translation:noItems")}
                                </div>
                            ) : (
                                <ul className="space-y-4">
                                    {quests.map((quest) => (
                                        <li key={quest.id}>
                                            <QuestCard
                                                quest={quest}
                                                onDelete={deleteQuestHandler}
                                                onEdit={updateQuestHandler}
                                                disableEdit={!canEditQuest(quest.id)}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Streak
