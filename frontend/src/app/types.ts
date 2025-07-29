
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
export interface DataResponse<T> {
    items: T[];
    total: number;
    page:  number;
    size:  number;
    pages: number;
}


export interface Note {
  id: string
  title: string
  content: string
  created_at?: Date
  updated_at?: Date
  tags?: string[]
  visibility: string
}

export interface TokenData {
  access_token: string;
  full_name: string;
  email: string;
  user_id: number | string;
  token_type: string;
}
export interface ShareNoteRequest {
  note_id: string;
  shared_with_user_email: string;
}