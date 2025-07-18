import type {LearnData, LearnSessionStrategy} from "@/components/learn/session/types.ts";
import LearnManager from "@/components/learn/LearnManager.tsx";
import {useEffect, useRef, useState} from "react";
import type {LearnViewKey} from "@/components/learn/learnview/types.ts";
import {LearnDataContext} from "@/contexts/LearnDataContext.tsx";
import Loading from "@/components/Loading.tsx";
import Result from "@/components/learn/Result.tsx";

interface Props{
    strategy: LearnSessionStrategy;
}

const LearnSession = (props: Props) => {
    const { viewSequence, getLearnData, getResultsAndSave} = props.strategy;

    const [ currentIndex, setCurrentIndex ] = useState(0);
    const [learnData, setLearnData] = useState<LearnData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [sessionFinished, setSessionFinished] = useState(false);
    const [retry, setRetry] = useState(false);

    const [loading, setLoading] = useState(false);

    const currentView = useRef<LearnViewKey>('jteMatch');
    const startTimestamp = useRef(Date.now());

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        setError(null)

        getLearnData()
            .then((data) => {
                if (!cancelled) {
                    setLearnData(data)
                    setLoading(false)
                    currentView.current = viewSequence[currentIndex];
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    console.error(err)
                    setError('Error while loading learn data!')
                    setLoading(false)
                }
            })

        return () => {
            cancelled = true
        }
    }, [getLearnData, currentIndex])

    const handleViewComplete = () => {
        if (currentIndex < viewSequence.length-1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setRetry(true);
            setSessionFinished(true);
        }
    }

    const pushFalseView = (view: LearnViewKey, data: LearnData | null) => {
        currentView.current = view;

        if (data !== null) {
            setLearnData({
                ...data,
                setResults: () => {},
                refresh: !data.refresh,
            });
            return;
        }

        setLearnData(data);
    }

    if (error) {
        return <div>{error}</div>
    }

    if (sessionFinished && !retry) {
        return <Result duration={(Date.now()-startTimestamp.current)} correctness={getResultsAndSave()}/>
    }

    return (
        <>
            <LearnDataContext.Provider value={learnData}>
                <LearnManager currentView={currentView.current}
                              nextView={handleViewComplete}
                              viewCount={viewSequence.length}
                              retry={retry}
                              setRetry={setRetry}
                              pushFalseView={pushFalseView}/>
            </LearnDataContext.Provider>

            <Loading isLoading={loading}/>
        </>
    )
}
export default LearnSession
