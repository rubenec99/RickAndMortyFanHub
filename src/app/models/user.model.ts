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
  success?: string;
  error?: string;
  token?: string; // Si se implementa tokens JWT u otra forma de autenticación.
}
