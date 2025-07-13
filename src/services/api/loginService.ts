import {api} from "@/services/api/client.ts";

export interface Credentials {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
}

export interface User {
    id: string;
}

export async function apiLogin(credentials: Credentials){
    return  api.post<LoginResponse>('/auth/login', credentials);
}