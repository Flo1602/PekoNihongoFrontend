import { motion } from "framer-motion";
import type {Transition} from "motion";
import {useLocation} from "react-router-dom";

const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 }
};

const pageTransition: Transition = {
    ease: "easeInOut",
    duration: 0.3
};

interface Props{
    children: React.ReactNode;
}

const AnimatedPage = ({children}: Props) => {

    const { pathname } = useLocation();

    return (
        <motion.div
            key={pathname}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="flex-1 flex flex-col h-full w-full"
        >
            {children}
        </motion.div>
    )
}
export default AnimatedPage
