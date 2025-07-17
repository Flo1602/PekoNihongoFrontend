import {useTranslation} from "react-i18next";
import WordsIcon from "@/assets/icons/WordsIcon.tsx";
import KanjiIcon from "@/assets/icons/KanjiIcon.tsx";
import SentenceIcon from "@/assets/icons/SentenceIcon.tsx";
import QuestionIcon from "@/assets/icons/QuestionIcon.tsx";
import SubMenu from "@/components/SubMenu.tsx";

const LearnMenu = () => {
    const {t} = useTranslation();

    const elements = [
        {path: '/learning/words', icon: WordsIcon, label: t('translation:words')},
        {path: '/learning/kanji', icon: KanjiIcon, label: t('translation:kanji')},
        {path: '/learning/sentences', icon: SentenceIcon, label: t('translation:sentences')},
        {path: '/learning/questions', icon: QuestionIcon, label: t('translation:questions')},
    ];

    return (
        <SubMenu elements={elements}>{t('translation:learn')}</SubMenu>
    );
}
export default LearnMenu
