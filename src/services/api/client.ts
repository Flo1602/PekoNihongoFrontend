import axios from "axios";

export const api = axios.create({
    baseURL: "http://10.0.0.8:8080/api",
    headers: { "Content-Type": "application/json" },
});
