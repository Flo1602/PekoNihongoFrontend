import {useTranslation} from "react-i18next";
import SubMenu from "@/components/SubMenu.tsx";
import {FlameIcon} from "lucide-react";
import SettingsIcon from "@/assets/icons/SettingsIcon.tsx";
import ShopIcon from "@/assets/icons/ShopIcon.tsx";
import CheckListIcon from "@/assets/icons/CheckListIcon.tsx";

const OtherMenu = () => {
    const {t} = useTranslation();

    const elements = [
        {path: '/other/shop', icon: ShopIcon, label: t('translation:shop')},
        {path: '/other/streak', icon: FlameIcon, label: t('translation:streak')},
        {path: '/other/quests', icon: CheckListIcon, label: t('translation:quests')},
        {path: '/other/settings', icon: SettingsIcon, label: t('translation:settings')},
    ];

    return (
        <SubMenu elements={elements}>{t('translation:other')}</SubMenu>
    );
}
export default OtherMenu
