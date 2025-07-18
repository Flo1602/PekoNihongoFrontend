import SubMenu from "@/components/SubMenu.tsx";
import {useTranslation} from "react-i18next";
import DailyIcon from "@/assets/icons/DailyIcon.tsx";
import LearnProgress from "@/components/learn/LearnProgress.tsx";
import {useEffect, useState} from "react";
import {getWordProgress, type ProgressData} from "@/services/api/progressService.ts";

const WordsLearningMenu = () => {

    const {t} = useTranslation();

    const [ progressData, setProgressData ] = useState<ProgressData>({dueToday: 0, completedToday: 0, totalPending: 0});

    useEffect(() => {
        getWordProgress().then((res) =>{
            setProgressData(res.data);
        })
    }, []);

    const elements = [
        {path: '/learning/words/daily', icon: DailyIcon, label: t('translation:dailyWords')},
    ];

    return (
        <div className="flex flex-col flex-1">
            <SubMenu elements={elements}>
                {t('translation:vocabulary')}
            </SubMenu>

            <div
                className="fixed bottom-20 lg:bottom-0 left-0 w-full bg-base-300/80 backdrop-blur p-4 z-50">
                <LearnProgress
                    label={t('translation:words')}
                    dueToday={progressData.dueToday}
                    completedToday={progressData.completedToday}
                    totalPending={progressData.totalPending}
                />
            </div>
        </div>
    )
}
export default WordsLearningMenu
