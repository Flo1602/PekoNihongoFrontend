import axios from "axios";
import {isJwtValid} from "@/lib/jwtUtils.ts";
import {useAuth} from "@/hooks/useAuth.ts";

export const api = axios.create({
    baseURL: "http://10.0.0.8:8080/api",
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(config => {
    const token = api.defaults.headers.common["Authorization"] as string | undefined;
    if (token && !isJwtValid(token)) {
        const { logout } = useAuth();
        logout();
        return Promise.reject(new axios.Cancel('JWT expired – request canceled'));
    }
    return config;
});