import QuestCard from "@/components/other/QuestCard.tsx";
import type {Quest, QuestCategory} from "@/services/api/questService.ts";
import {useTranslation} from "react-i18next";

interface Props {
    quests: Quest[];
    questCategory: QuestCategory;
}

const QuestList = ({quests, questCategory}: Props) => {

    const {t} = useTranslation();

    const categoryLabel = (category: QuestCategory): string => {
        switch (category) {
            case "DAILY_QUEST":
                return t("translation:dailyQuests");
            case "WEEKLY_QUEST":
                return t("translation:weeklyQuests");
            case "CHALLENGE_QUEST":
                return t("translation:challengeQuests");
            default:
                return String(category);
        }
    }

    return (
        <div className="h-full bg-base-100 rounded-2xl shadow-sm p-0 flex flex-col max-h-full md:max-h-[37vh]">
            {/* Sticky Header innerhalb der Card */}
            <div className="top-0 z-10 bg-base-100/90 backdrop-blur supports-[backdrop-filter]:bg-base-100/70 border-b border-gray-700 rounded-t-2xl px-4 py-4 md:px-6 md:py-6  flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold">{categoryLabel(questCategory)}</h2>
            </div>

            {/* Quest-Liste */}
            <div className="overflow-y-auto scrollbar-thin px-4 md:px-6 py-4 space-y-4 h-full">
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
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
export default QuestList
