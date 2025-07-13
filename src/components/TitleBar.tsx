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
    const {pathname} = useLocation();

    const tabs = [
        {id: 1, path: '/learning', icon: HomeIcon, label: t('translation:learn'), details: [
                {id: 101, innerPath: '/learning/words', innerLabel: t('translation:words')},
                {id: 102, innerPath: '/learning/kanji', innerLabel: t('translation:kanji')},
                {id: 103, innerPath: '/learning/sentences', innerLabel: t('translation:sentences')},
                {id: 104, innerPath: '/learning/questions', innerLabel: t('translation:questions')}
            ]
        },
        {id: 2, path: '/catalog', icon: CatalogIcon, label: t('translation:catalog'), details: [
                {id: 201, innerPath: '/catalog/words', innerLabel: t('translation:words')},
                {id: 202, innerPath: '/catalog/kanji', innerLabel: t('translation:kanji')},
                {id: 203, innerPath: '/catalog/sentences', innerLabel: t('translation:sentences')},
                {id: 204, innerPath: '/catalog/questions', innerLabel: t('translation:questions')}
            ]
        },
        {id: 3, path: '/stats', icon: StatsIcon, label: t('translation:stats'), details: null},
        {id: 4, path: '/settings', icon: SettingsIcon, label: t('translation:settings'), details: null},
    ];

    const onClick = (path: string) => {
        navigate(path);
    }

    if (isMobile) return (
        <div className="dock dock dock-lg">
            {tabs.map(({path, icon: Icon, label}) => (
                <button key={label} className={pathname.includes(path) ? 'dock-active' : ''}
                        onClick={() => onClick(path)}>
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
                    {tabs.map(({id, path, icon: Icon, label, details}) => (
                        <li key={id} className="pl-4">
                            {!details ? (
                                <Link to={{pathname: path}}
                                      className={"flex items-center gap-2 px-3 py-2 text-gray-300 rounded-md" +
                                          (pathname.includes(path) ? 'px-3 py-1  bg-primary text-primary-content' : 'hover:text-white hover:bg-gray-700')}>
                                    <Icon className="h-5 w-5"/>
                                    <span className="text-base font-medium">{label}</span>
                                </Link>
                            ):
                                <div className="dropdown dropdown-end p-0">
                                    <div tabIndex={0} role="button" className={"flex items-center gap-2 px-3 py-2 text-gray-300 rounded-md rounded-field" +
                                        (pathname.includes(path) ? 'px-3 py-1  bg-primary text-primary-content' : 'hover:text-white hover:bg-gray-700')}>
                                        <Icon className="h-5 w-5"/>
                                        <span className="text-base font-medium">{label}</span>
                                    </div>
                                    <ul tabIndex={0} className="menu dropdown-content bg-base-200 rounded-box z-1 mt-4 p-2 shadow-sm w-full">
                                        {details.map(({id, innerPath, innerLabel}) => (
                                            <li key={id} className="">
                                                <Link to={{pathname: innerPath}}>
                                                    <span className="text-base font-medium">{innerLabel}</span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            }
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
export default TitleBar
