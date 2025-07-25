import { LoginCredentials,RegisterData } from "@/app/types";

const SERVER_URL = "http://localhost:8000/api"; // static base URL for the server API




// JWT token helpers
export function getToken() {
    return localStorage.getItem("access_token");
}

export function setToken(token: string) {
    localStorage.setItem("access_token", token);
}


// Auth service functions
export async function login(credentials: LoginCredentials) {
    const response = await fetch(`${SERVER_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });
    const data =  await response.json();

    if (data.access_token) {
       setToken(data.access_token)
    }
    return data
}

export async function register(data:RegisterData) {
    const response = await fetch(`${SERVER_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    return response;
}

export async function getMe(token: string) {
    const response = await fetch(`${SERVER_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.json();
}


export async function checkToken() {
    const token = getToken();
    if (!token) return false;

    const response = await fetch(`${SERVER_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401) {
        localStorage.removeItem("access_token");
        return false;
    }
    return response.ok;
}

