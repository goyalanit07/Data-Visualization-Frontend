import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});


export const signup = async (email: string, password: string): Promise<string> => {
    try {
        const response = await api.post("/auth/signup", { email, password });
        return response.data.message;
    } catch (error: any) {
        if (error.response && error.response.data) {
            throw new Error(error.response.data.message || "Login failed");
        }
        throw new Error("An unexpected error occurred");
    }
};

export const login = async (email: string, password: string): Promise<string> => {
    try {
        const response = await api.post("/auth/login", { email, password });
        return response.data;
    } catch (error: any) {
        if (error.response && error.response.data) {
            throw new Error(error.response.data.message || "Login failed");
        }
        throw new Error("An unexpected error occurred");
    }
};


export const logout = async (): Promise<void> => {
    try {
        await api.post("/auth/logout");
    } catch (error) {
        console.error("Logout failed", error);
    }
};

export default api;
