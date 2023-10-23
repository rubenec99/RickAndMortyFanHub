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
