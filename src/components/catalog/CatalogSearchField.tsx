import {useTranslation} from "react-i18next";
import {useDebounce} from "react-use";
import {type ChangeEvent, useState} from "react";

interface Props{
    setSearchDebounced: (search: string) => void;
    defaultSearch?: string;
}

const CatalogSearchField = ({setSearchDebounced, defaultSearch}: Props) => {

    const [search, setSearch] = useState<string>((defaultSearch) ? defaultSearch : "");
    useDebounce(() => setSearchDebounced(search), 300, [search]);
    const {t} = useTranslation();

    const changeSearch = (e: ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    return (
        <label className="input">
            <svg className="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <g
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeWidth="2.5"
                    fill="none"
                    stroke="currentColor"
                >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                </g>
            </svg>
            <input name="search" type="search" defaultValue={defaultSearch} onChange={changeSearch} placeholder={t("translation:search")} />
        </label>
    )
}
export default CatalogSearchField
