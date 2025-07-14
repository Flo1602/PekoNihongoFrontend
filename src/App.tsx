import {AuthProvider} from "./contexts/AuthProvider.tsx";
import {Navigate, Route, Routes} from "react-router-dom";
import TitleBar from "./components/TitleBar.tsx";
import Login from "./pages/Login.tsx";
import RequireAuth from "./components/RequireAuth.tsx";
import Catalog from "./pages/Catalog/Catalog.tsx";
import LearnMenu from "@/pages/Learning/LearnMenu.tsx";
import Stats from "@/pages/Stats.tsx";
import Settings from "@/pages/Settings.tsx";
import {useEffect} from "react";
import WordList from "@/pages/Catalog/WordList.tsx";
import KanjiList from "@/pages/Catalog/KanjiList.tsx";
import SentenceList from "@/pages/Catalog/SentenceList.tsx";
import QuestionList from "@/pages/Catalog/QuestionList.tsx";
import WordsLearningMenu from "@/pages/Learning/WordsLearningMenu.tsx";
import KanjiLearnMenu from "@/pages/Learning/KanjiLearnMenu.tsx";
import SentenceLearnMenu from "@/pages/Learning/SentenceLearnMenu.tsx";
import QuestionLearnMenu from "@/pages/Learning/QuestionLearnMenu.tsx";

function App() {

    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-theme', typeof window !== 'undefined' ? localStorage.getItem('theme') || 'default' : 'default');
    }, []);

    return (
        <AuthProvider>
            <div className="min-h-screen flex flex-col">
                <TitleBar/>
                <Routes>
                    <Route path="login" element={<Login/>}/>
                    <Route element={<RequireAuth/>}>
                        <Route path="/" element={<Navigate to="/learning" replace />}/>
                        <Route path="learning">
                            <Route index element={<LearnMenu/>}/>
                            <Route path="words" element={<WordsLearningMenu/>}/>
                            <Route path="kanji" element={<KanjiLearnMenu/>}/>
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
                </Routes>
            </div>
        </AuthProvider>
    )
}

export default App
