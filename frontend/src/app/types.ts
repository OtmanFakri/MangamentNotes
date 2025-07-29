
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    confirm_password:string
}
export interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  modifiedAt: Date
  tags?: string[]
  visibility: "private" | "shared" | "public"
}