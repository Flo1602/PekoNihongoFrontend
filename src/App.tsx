import {AuthProvider} from "./contexts/AuthProvider.tsx";
import {Navigate, Outlet, Route, Routes, useLocation} from "react-router-dom";
import TitleBar from "./components/TitleBar.tsx";
import Login from "./pages/Login.tsx";
import RequireAuth from "./components/RequireAuth.tsx";
import Catalog from "@/pages/catalog/Catalog.tsx";
import LearnMenu from "@/pages/learn/LearnMenu.tsx";
import Stats from "@/pages/Stats.tsx";
import {useEffect} from "react";
import WordList from "@/pages/catalog/WordList.tsx";
import KanjiList from "@/pages/catalog/KanjiList.tsx";
import SentenceList from "@/pages/catalog/SentenceList.tsx";
import QuestionList from "@/pages/catalog/QuestionList.tsx";
import WordsLearningMenu from "@/pages/learn/WordsLearningMenu.tsx";
import KanjiLearnMenu from "@/pages/learn/KanjiLearnMenu.tsx";
import SentenceLearnMenu from "@/pages/learn/SentenceLearnMenu.tsx";
import QuestionLearnMenu from "@/pages/learn/QuestionLearnMenu.tsx";
import Settings from "@/pages/Settings.tsx";
import { AnimatePresence } from "framer-motion";
import AnimatedPage from "@/components/AnimatedPage.tsx";
import DailyWords from "@/pages/learn/DailyWords.tsx";
import DailyKanji from "@/pages/learn/DailyKanji.tsx";

function App() {
    const location = useLocation();

    const learningRegex = /^\/learning\/[^/]+\/[^/]+\/?$/;
    const isLearningRoute = learningRegex.test(location.pathname);

    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-theme', typeof window !== 'undefined' ? localStorage.getItem('theme') || 'default' : 'default');
    }, []);

    return (
        <AuthProvider>
            <div className="min-h-screen flex flex-col bg-base-300">
                <TitleBar isVisible={!isLearningRoute}/>
                <AnimatePresence mode="wait">
                    <Routes>
                        <Route path="login" element={<Login/>}/>
                        <Route element={<RequireAuth/>}>
                            <Route element={<AnimatedPage><Outlet /></AnimatedPage>}>
                                <Route path="/" element={<Navigate to="/learning" replace />}/>
                                <Route path="learning">
                                    <Route index element={<LearnMenu/>}/>
                                    <Route path="words">
                                        <Route index element={<WordsLearningMenu/>}/>
                                        <Route path="daily" element={<DailyWords/>}/>
                                    </Route>
                                    <Route path="kanji">
                                        <Route index element={<KanjiLearnMenu/>}/>
                                        <Route path="daily" element={<DailyKanji/>}/>
                                    </Route>
                                    <Route path="sentences" element={<SentenceLearnMenu/>}/>
                                    <Route path="questions" element={<QuestionLearnMenu/>}/>
                                </Route>
                                <Route path="catalog">
                                    <Route index element={<Catalog/>}/>
                                    <Route path="words" element={<WordList/>}/>
                                    <Route path="kanji" element={<KanjiList/>}/>
                                    <Route path="sentences" element={<SentenceList/>}/>
                                    <Route path="questions" element={<QuestionList/>}/>
                                </Route>
                                <Route path="stats" element={<Stats/>}/>
                                <Route path="settings" element={<Settings/>}/>
                            </Route>
                        </Route>
                    </Routes>

                </AnimatePresence>
            </div>
        </AuthProvider>
    )
}

export default App
