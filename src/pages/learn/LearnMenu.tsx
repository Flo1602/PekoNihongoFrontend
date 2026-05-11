import {useTranslation} from "react-i18next";
import WordsIcon from "@/assets/icons/WordsIcon.tsx";
import KanjiIcon from "@/assets/icons/KanjiIcon.tsx";
import PenIcon from "@/assets/icons/PenIcon.tsx";
import QuestionIcon from "@/assets/icons/QuestionIcon.tsx";
import SubMenu from "@/components/SubMenu.tsx";

const LearnMenu = () => {
    const {t} = useTranslation();

    const elements = [
        {path: '/learning/words', icon: WordsIcon, label: t('words')},
        {path: '/learning/kanji', icon: KanjiIcon, label: t('kanji')},
        {path: '/learning/sentences', icon: PenIcon, label: t('sentences')},
        {path: '/learning/questions', icon: QuestionIcon, label: t('questions')},
    ];

    return (
        <SubMenu elements={elements}>{t('learn')}</SubMenu>
    );
}
export default LearnMenu
