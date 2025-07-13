import {useTranslation} from "react-i18next";
import {type ChangeEvent, useEffect, useState} from "react";
import {useAuth} from "@/hooks/useAuth.ts";
import {useNavigate} from "react-router-dom";
import {apiLogin} from "@/services/api/loginService.ts";

const Login = () => {
    const {t} = useTranslation();
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const {login, token} = useAuth();
    const navigate = useNavigate()
    const [error, setError] = useState(false);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        })
    };

    const handleSubmit = () => {
        setError(false);
        setLoading(true);

        apiLogin(formData).then((response) => {
            const {token} = response.data;

            login(token);

            navigate("/learning");
        }).catch(() => {
            setError(true);
        }).finally(() => {
            setLoading(false);
        })
    }

    useEffect(() => {
        if (token) {
            console.log("Already logged in");
            navigate("/");
        }
    }, [])

    if (loading) return (
        <div className="flex justify-center items-center flex-1">
            <span className="loading loading-spinner loading-xl"></span>
        </div>
    )

    return (
        <>
            <h1 className="flex justify-center bg-base-300 items-center text-4xl font-semibold pt-5">{t("translation:welcome")}</h1>
            <div className="bg-base-300 flex justify-center items-center flex-1">
                <fieldset className="fieldset bg-base-200 border-base-100 drop-shadow-2xl rounded-box w-xs border p-4">
                    {error && <div role="alert" className="alert alert-error alert-soft">
                        <span>{t("translation:loginFailed")}</span>
                    </div>}
                    <legend className="fieldset-legend">{t("translation:login")}</legend>

                    <label className="label">{t("translation:username")}</label>
                    <input id="username" onChange={handleChange} type="username" className="input"
                           placeholder={t("translation:username")}/>

                    <label className="label">{t("translation:password")}</label>
                    <input id="password" onChange={handleChange} type="password" className="input"
                           placeholder={t("translation:password")}/>

                    <button onClick={handleSubmit} className="btn btn-neutral mt-4">{t("translation:login")}</button>
                </fieldset>
            </div>
        </>
    )
}
export default Login
