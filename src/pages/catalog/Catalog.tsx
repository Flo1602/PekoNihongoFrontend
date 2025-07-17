import {useTranslation} from "react-i18next";
import SubMenu from "@/components/SubMenu.tsx";
import WordsIcon from "@/assets/icons/WordsIcon.tsx";
import QuestionIcon from "@/assets/icons/QuestionIcon.tsx";
import KanjiIcon from "@/assets/icons/KanjiIcon.tsx";
import SentenceIcon from "@/assets/icons/SentenceIcon.tsx";

const Catalog = () => {

    const {t} = useTranslation();

    const elements = [
        {path: '/catalog/words', icon: WordsIcon, label: t('translation:words')},
        {path: '/catalog/kanji', icon: KanjiIcon, label: t('translation:kanji')},
        {path: '/catalog/sentences', icon: SentenceIcon, label: t('translation:sentences')},
        {path: '/catalog/questions', icon: QuestionIcon, label: t('translation:questions')},
    ];

    return (
        <SubMenu elements={elements}>{t('translation:catalog')}</SubMenu>
    );
}
export default Catalog
