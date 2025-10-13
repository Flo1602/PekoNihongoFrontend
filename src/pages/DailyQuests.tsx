import {
    createDailyQuest,
    deleteQuest,
    getDailyQuests,
    type Quest,
    type QuestType,
    QuestTypes, updateQuest
} from "@/services/api/questService.ts";
import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";
import QuestCard from "@/components/learn/QuestCard.tsx";

const DailyQuests = () => {
    const {t} = useTranslation();

    const [quests, setQuests] = useState<Quest[]>([]);

    useEffect(() => {
        refreshQuests();
    }, []);

    const createQuestHandler = (questType: QuestType): void =>{
        const quest: Quest = {
            id: 0,
            type: questType,
            category: 'DAILY_QUEST',
            text: "",
            goal: 1,
            progress: 0
        }

        createDailyQuest(quest).then(() =>{
            refreshQuests();
        });
    }

    const refreshQuests = (): void =>{
        getDailyQuests().then(res =>{
            setQuests(res.data);
        })
    }

    const deleteQuestHandler = (questId: number): void =>{
        deleteQuest(questId).then(() =>{
            refreshQuests();
        });
    }

    const updateQuestHandler = (quest: Quest): void =>{
        updateQuest(quest).then(() =>{
            refreshQuests();
        });
    }

    return (
        <div className="flex-1 bg-base-300 flex flex-col items-center p-6 space-y-8">
            <div className="text-5xl font-bold mb-14">{t("streak")}</div>

            <ul className={"flex-col flex-1 space-y-8 w-full max-w-md"}>
                <div className="flex w-full items-center justify-between border-b border-primary/20">
                    <h1 className="text-lg font-semibold">{t("translation:dailyQuests")}</h1>
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="btn m-1">{t("translation:create")}</div>
                        <ul tabIndex={-1} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                            {QuestTypes.map(type => (
                                <li key={type}><button onClick={() => createQuestHandler(type)}>{t(type)}</button></li>
                            ))}
                        </ul>
                    </div>
                </div>

                {quests.map(quest => (
                    <li key={quest.id}>
                        <QuestCard quest={quest} onDelete={deleteQuestHandler} onEdit={updateQuestHandler}/>
                    </li>
                ))}
            </ul>
        </div>
    )
}
export default DailyQuests
