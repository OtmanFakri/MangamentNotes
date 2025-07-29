import { DataResponse, LoginCredentials,Note,RegisterData, ShareNoteRequest, TokenData } from "@/app/types";

const SERVER_URL = "http://localhost:8000/api"; // static base URL for the server API




// JWT token helpers
export function getToken() {
    return localStorage.getItem("access_token");
}

export function setToken(data: TokenData) {
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("full_name", data.full_name);
  localStorage.setItem("email", data.email);
  localStorage.setItem("user_id", data.user_id.toString());
  localStorage.setItem("token_type", data.token_type);
}

export async function login(credentials: LoginCredentials) {
    const response = await fetch(`${SERVER_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });
    const data =  await response.json();

    if (data.access_token) {
       setToken(data)
    }
    return data
}

export function clearToken() {
  localStorage.clear();
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

export async function getNotes() {
    const token = getToken();
    if (!token) return false;
  const response = await fetch(`${SERVER_URL}/notes/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data: DataResponse<Note> = await response.json();
  return data.items;
}

export async function createNote(title: string, content: string, tag_names: string[]) {
    const token = getToken();
    if (!token) return false;

    const response = await fetch(`${SERVER_URL}/notes/`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ title, content, tag_names }),
    });

    if (!response.ok) {
        return false;
    }

    const data: Note = await response.json();
    return data;
}
export async function updateNote(id: string, title: string, content: string, tag_names: string[]) {
  const token = getToken();
  if (!token) return false;

  const response = await fetch(`${SERVER_URL}/notes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ title, content, tag_names }),
  });

  if (!response.ok) {
    return false;
  }

  const data: Note = await response.json();
  return data;
}

export async function deleteNote(id: number) {
  const token = getToken();
  if (!token) return false;

  const response = await fetch(`${SERVER_URL}/notes/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    },
  });

  return response.ok;
}
export async function shareNote(data: ShareNoteRequest) {
  const token = getToken();
  if (!token) return false;

  const response = await fetch(`${SERVER_URL}/notes/share`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    return false;
  }

  return true;
}