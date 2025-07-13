import {useAuth} from "@/hooks/useAuth.ts";

const TitleBar = () => {

    const { logout, token } = useAuth();

    const logOutAction = () => {
        logout();
    }

    return (
        <div className="navbar bg-base-100 shadow-sm">
            <div className="flex-1">
                <a className="btn btn-ghost text-xl">ペコ日本語</a>
            </div>
            <div className="flex-none">
                {token && <button onClick={logOutAction} className="btn btn-primary">Logout</button> }

            </div>
        </div>
    )
}
export default TitleBar
