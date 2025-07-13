import {useTranslation} from "react-i18next";
import {useAuth} from "@/hooks/useAuth.ts";
import {type ChangeEvent, useEffect, useState} from "react";

const Settings = () => {
    const {t} = useTranslation();
    const { logout } = useAuth();
    const { i18n } = useTranslation();
    const [language, setLanguage] = useState(i18n.language);
    const [theme, setLocalTheme] = useState(() =>
        typeof window !== 'undefined'
            ? localStorage.getItem('theme') || 'default'
            : 'default'
    );

    const changeLanguage = (e: ChangeEvent<HTMLSelectElement>) => {
        const selectedLang = e.target.value;
        setLanguage(selectedLang);
        i18n.changeLanguage(selectedLang);
    };

    const changeTheme = (e: ChangeEvent<HTMLSelectElement>) => {
        const root = document.documentElement;
        root.setAttribute('data-theme', e.target.value);
        setLocalTheme(e.target.value);
        localStorage.setItem('theme', e.target.value);
    }

    useEffect(() => {
        setLanguage(i18n.language);
    }, [i18n.language]);

    return (
        <main className="flex-1 flex items-center justify-center bg-base-300 p-6">
            <div className="card w-full max-w-xl bg-base-200 shadow-2xl">
                <div className="card-body space-y-8">
                    <h1 className="card-title justify-center text-4xl font-bold tracking-wide">
                        {t("translation:settings")}
                    </h1>

                    <section className="space-y-6">
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text flex items-center gap-2">
                                    {t("translation:language")}
                                </span>
                            </label>
                            <select value={language} onChange={changeLanguage} className="select select-bordered w-full">
                                <option value="en">English</option>
                                <option value="de">Deutsch</option>
                                <option value="ja">日本語</option>
                            </select>
                        </div>

                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text flex items-center gap-2">
                                    {t("translation:theme")}
                                </span>
                            </label>
                            <select value={theme} onChange={changeTheme} className="select select-bordered w-full">
                                <option value="dark">Dark</option>
                                <option value="synthwave">Synthwave</option>
                                <option value="halloween">Halloween</option>
                                <option value="forest">Forest</option>
                                <option value="dracula">Dracula</option>
                                <option value="night">Night</option>
                            </select>
                        </div>
                    </section>

                    <button onClick={logout} className="btn btn-outline btn-error gap-2">
                        {t("translation:logout")}
                    </button>
                </div>
            </div>
        </main>
    );
}
export default Settings
