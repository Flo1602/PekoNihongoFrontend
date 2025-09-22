import { createBrowserRouter, Navigate } from "react-router-dom";

import RequireAuth from "@/components/RequireAuth";
import Login from "@/pages/Login";
import Catalog from "@/pages/catalog/Catalog";
import LearnMenu from "@/pages/learn/LearnMenu";
import Stats from "@/pages/Stats";
import WordList from "@/pages/catalog/WordList";
import KanjiList from "@/pages/catalog/KanjiList";
import SentenceList from "@/pages/catalog/SentenceList";
import QuestionList from "@/pages/catalog/QuestionList";
import WordsLearningMenu from "@/pages/learn/WordsLearningMenu";
import KanjiLearnMenu from "@/pages/learn/KanjiLearnMenu";
import SentenceLearnMenu from "@/pages/learn/SentenceLearnMenu";
import QuestionLearnMenu from "@/pages/learn/QuestionLearnMenu";
import Settings from "@/pages/Settings";
import DailyWords from "@/pages/learn/DailyWords";
import DailyKanji from "@/pages/learn/DailyKanji";
import AnimatedShell from "@/components/layouts/AnimatedShell.tsx";
import RootLayout from "@/components/layouts/RootLayout.tsx";
import SpeakTheWord from "@/pages/learn/SpeakTheWord.tsx";
import WordDrafts from "@/pages/catalog/WordDrafts.tsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            { path: "login", element: <Login /> },
            {
                element: <RequireAuth />,
                children: [
                    {
                        element: <AnimatedShell />,
                        children: [
                            { index: true, element: <Navigate to="/learning" replace /> },

                            {
                                path: "learning",
                                children: [
                                    { index: true, element: <LearnMenu /> },
                                    {
                                        path: "words",
                                        children: [
                                            { index: true, element: <WordsLearningMenu /> },
                                            { path: "daily", element: <DailyWords /> },
                                            { path: "speakTheWord", element: <SpeakTheWord /> },
                                        ],
                                    },
                                    {
                                        path: "kanji",
                                        children: [
                                            { index: true, element: <KanjiLearnMenu /> },
                                            { path: "daily", element: <DailyKanji /> },
                                        ],
                                    },
                                    { path: "sentences", element: <SentenceLearnMenu /> },
                                    { path: "questions", element: <QuestionLearnMenu /> },
                                ],
                            },

                            {
                                path: "catalog",
                                children: [
                                    { index: true, element: <Catalog /> },
                                    { path: "words", children: [
                                        { index: true, element: <WordList/> },
                                        { path: "drafts", element: <WordDrafts/> }
                                    ] },
                                    { path: "kanji", element: <KanjiList /> },
                                    { path: "sentences", element: <SentenceList /> },
                                    { path: "questions", element: <QuestionList /> },
                                ],
                            },

                            { path: "stats", element: <Stats /> },
                            { path: "settings", element: <Settings /> },
                        ],
                    },
                ],
            },
        ],
    },
]);
