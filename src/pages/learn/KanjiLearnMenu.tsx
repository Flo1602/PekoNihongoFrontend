import {useTranslation} from "react-i18next";
import {useEffect, useState} from "react";
import {getKanjiProgress, type ProgressData} from "@/services/api/progressService.ts";
import DailyIcon from "@/assets/icons/DailyIcon.tsx";
import SubMenu from "@/components/SubMenu.tsx";
import LearnProgress from "@/components/learn/LearnProgress.tsx";

const KanjiLearnMenu = () => {
    const {t} = useTranslation();

    const [ progressData, setProgressData ] = useState<ProgressData>({dueToday: 0, completedToday: 0, totalPending: 0});

    useEffect(() => {
        getKanjiProgress().then((res) =>{
            setProgressData(res.data);
        })
    }, []);

    const elements = [
        {path: '/learning/kanji/daily', icon: DailyIcon, label: t('translation:dailyKanji')},
    ];

    return (
        <div className="flex flex-col flex-1">
            <SubMenu elements={elements}>
                {t('translation:kanji')}
            </SubMenu>

            <div
                className="fixed bottom-20 lg:bottom-0 left-0 w-full bg-base-300/80 backdrop-blur p-4 z-50">
                <LearnProgress
                    label={t('translation:kanji')}
                    dueToday={progressData.dueToday}
                    completedToday={progressData.completedToday}
                    totalPending={progressData.totalPending}
                />
            </div>
        </div>
    )
}
export default KanjiLearnMenu
