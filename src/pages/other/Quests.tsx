import {getAllQuests, type Quest, type QuestCategory} from "@/services/api/questService.ts";
import {useEffect, useState} from "react";
import QuestList from "@/components/other/QuestList.tsx";
import {Temporal} from "@js-temporal/polyfill";

const Quests = () => {

    const [quests, setQuests] = useState<Map<QuestCategory, Quest[]>>(new Map());

    useEffect(() => {
        getAllQuests().then(res => {
            const allQuests: Quest[] = res.data;
            const questMap = new Map();

            allQuests.forEach(quest => {
                if(quest.expirationDate){
                    quest.expirationDate = Temporal.PlainDate.from(quest.expirationDate);
                }

                questMap.set(quest.category, [...(questMap.get(quest.category) || []), quest]);
            })

            setQuests(questMap);
        })
    }, []);

    return (
        <div className="flex-1 bg-base-300 overflow-y-auto scrollbar-thin max-h-[90vh] mx-auto w-full max-w-6xl px-4 md:px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center pt-6">
                {[...quests.entries()].map(([key, value]) => (
                    <div className="h-full" key={key}>
                        <QuestList quests={value} questCategory={key}/>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default Quests
