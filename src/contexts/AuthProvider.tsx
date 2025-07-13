import {type ReactNode, useState} from "react";
import {AuthContext, type AuthContextType} from "./AuthContext.tsx";
import {api} from "@/services/api/client.ts";
import {isJwtValid} from "@/lib/jwtUtils.ts";

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [token, setToken] = useState<string | null>(
        () => localStorage.getItem('token')
    );
    const valid = isJwtValid(token);

    if (token && valid) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else if(token && !valid) {
        setToken(null);
        localStorage.removeItem('token');
    }

    const login: AuthContextType['login'] = (bearerToken) => {
        setToken(bearerToken);
        localStorage.setItem('token', bearerToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    };

    const logout: AuthContextType['logout'] = () => {
        setToken(null);
        localStorage.removeItem('token');
        api.defaults.headers.common["Authorization"] = null;
    };

    return (
        <AuthContext.Provider value={{ token, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};