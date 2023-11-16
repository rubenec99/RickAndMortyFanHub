export interface RegistrationData {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password: string;
  birth_date: string;
}

export interface RegistrationResponse {
  success?: string;
  error?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface LoginResponse {
  user_id: string;
  user_type: string;
  username: string;
  success?: string;
  error?: string;
  token?: string;
  expiresAt: number;
}
