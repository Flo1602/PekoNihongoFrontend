import {AnimatePresence} from "framer-motion";
import AnimatedPage from "@/components/AnimatedPage.tsx";
import {Outlet, useLocation} from "react-router-dom";

export default function AnimatedShell() {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <AnimatedPage key={location.pathname}>
                <Outlet />
            </AnimatedPage>
        </AnimatePresence>
    );
}