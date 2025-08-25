import {useEffect} from "react";
import {useBlocker} from "react-router-dom";
import {useTranslation} from "react-i18next";

function useConfirmNavigation(when: boolean) {
    const blocker = useBlocker(when);
    const {t} = useTranslation();

    useEffect(() => {
        if (blocker.state === "blocked") {
            const confirmLeave = window.confirm(t("translation:confirmLeave"));
            if (confirmLeave) {
                blocker.proceed(); // Navigation erlauben
            } else {
                blocker.reset();   // Navigation abbrechen
            }
        }
    }, [blocker]);
}

export default useConfirmNavigation;