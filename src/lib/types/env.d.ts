export interface Env {
    SERVER_BASE_URL: string;
}

declare global {
    interface Window {
        _env_: Env;
    }
}

export {};