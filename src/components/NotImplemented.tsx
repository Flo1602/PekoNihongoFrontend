import { Link } from 'react-router-dom'
import ConstructionIcon from "@/assets/icons/ConstructionIcon.tsx";
import {useTranslation} from "react-i18next";

const NotImplemented = () => {

    const {t} = useTranslation();

    return (
        <div className="hero flex-1 bg-base-300">
            <div className="hero-content flex-col lg:flex-row-reverse">
                <ConstructionIcon/>
                <div className="text-center lg:text-left">
                    <h1 className="text-5xl font-bold text-primary mb-4">
                        {t("translation:comingSoon")}
                    </h1>
                    <p className="py-3 text-lg text-gray-600">
                        {t("translation:notImplementedInfo")}
                    </p>
                    <div className="mt-6 flex justify-center lg:justify-start space-x-4">
                        <Link to="/" className="btn btn-primary">
                            ← {t("translation:backHome")}
                        </Link>
                        <button className="btn btn-outline" onClick={() => window.location.reload()}>
                            {t("translation:retry")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
export default NotImplemented
