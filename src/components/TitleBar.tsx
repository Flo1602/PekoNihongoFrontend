import {useIsMobile} from "@/hooks/useIdMobile.ts";
import {useTranslation} from "react-i18next";
import {Link, useLocation, useNavigate} from "react-router-dom";
import HomeIcon from "@/assets/icons/HomeIcon.tsx";
import CatalogIcon from "@/assets/icons/CatalogIcon.tsx";
import StatsIcon from "@/assets/icons/StatsIcon.tsx";
import SettingsIcon from "@/assets/icons/SettingsIcon.tsx";

const TitleBar = () => {

    const isMobile = useIsMobile();
    const {t} = useTranslation();
    const navigate = useNavigate()
    const { pathname } = useLocation();

    const tabs = [
        { path: '/',            icon: HomeIcon,     label: t('translation:learn')   },
        { path: '/catalog',     icon: CatalogIcon,  label: t('translation:catalog') },
        { path: '/stats',       icon: StatsIcon,    label: t('translation:stats')   },
        { path: '/settings',    icon: SettingsIcon, label: t('translation:settings')},
    ];

    const onClick = (path: string) => {
        navigate(path);
    }

    if (isMobile) return (
        <div className="dock dock dock-lg">
            {tabs.map(({ path, icon: Icon, label }) => (
                <button key={label} className={pathname === path ? 'dock-active' : ''} onClick={() => onClick(path)}>
                    <Icon className="size-[1.2em]"/>
                    <span className="dock-label">{label}</span>
                </button>
            ))}
        </div>
    );

    return (
        <div className="navbar bg-base-100 shadow-sm">
            <div className="navbar-start w-screen">
                <Link to={{pathname: "/"}} className="btn btn-ghost text-xl">{t("translation:appName")}</Link>
                <ul className="menu menu-horizontal px-1 ml-10">
                    {tabs.map(({ path, icon: Icon, label }) => (
                        <li key={label} className="pl-4">
                            <Link to={{pathname: path}} className={"flex items-center gap-2 px-3 py-2 text-gray-300 rounded-md" +
                                (pathname === path ? 'px-3 py-1  bg-primary text-primary-content' : 'hover:text-white hover:bg-gray-700')}>
                                <Icon className="h-5 w-5"/>
                                <span className="text-base font-medium">{label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
export default TitleBar
