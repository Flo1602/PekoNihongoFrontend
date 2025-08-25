import {Outlet, useLocation} from "react-router-dom";
import {useEffect} from "react";
import TitleBar from "@/components/layouts/TitleBar.tsx";

export default function RootLayout() {
    const location = useLocation();

    const learningRegex = /^\/learning\/[^/]+\/[^/]+\/?$/;
    const isLearningRoute = learningRegex.test(location.pathname);

    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute(
            "data-theme",
            typeof window !== "undefined" ? localStorage.getItem("theme") || "default" : "default"
        );
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-base-300">
            <TitleBar isVisible={!isLearningRoute} />
            <Outlet />
        </div>
    );
}