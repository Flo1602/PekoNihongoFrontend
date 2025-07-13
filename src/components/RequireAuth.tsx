import {useAuth} from "../hooks/useAuth.ts";
import {Navigate, Outlet, useLocation} from "react-router-dom";

const RequireAuth = () => {
    const { token } = useAuth();
    const location = useLocation();

    if (!token) {
        console.log("Redirecting to login");
        return (
            <Navigate to="/login" state={{from: location}} replace/>
        )
    }

    return <Outlet/>;
}
export default RequireAuth
