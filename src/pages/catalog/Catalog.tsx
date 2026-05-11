import {useTranslation} from "react-i18next";
import SubMenu from "@/components/SubMenu.tsx";
import WordsIcon from "@/assets/icons/WordsIcon.tsx";
import QuestionIcon from "@/assets/icons/QuestionIcon.tsx";
import KanjiIcon from "@/assets/icons/KanjiIcon.tsx";
import PenIcon from "@/assets/icons/PenIcon.tsx";
import WordDraftsIcon from "@/assets/icons/WordDraftsIcon.tsx";

const Catalog = () => {

    const {t} = useTranslation();

    const elements = [
        {path: '/catalog/words', icon: WordsIcon, label: t('words')},
        {path: '/catalog/words/drafts', icon: WordDraftsIcon, label: t('wordDrafts')},
        {path: '/catalog/kanji', icon: KanjiIcon, label: t('kanji')},
        {path: '/catalog/sentences', icon: PenIcon, label: t('sentences')},
        {path: '/catalog/questions', icon: QuestionIcon, label: t('questions')},
    ];

    return (
        <SubMenu elements={elements}>{t('catalog')}</SubMenu>
    );
}
export default Catalog
