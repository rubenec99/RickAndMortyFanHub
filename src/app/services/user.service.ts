import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  RegistrationData,
  RegistrationResponse,
  LoginData,
  LoginResponse,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // URL base del API para las operaciones del usuario.
  private apiUrl = 'http://localhost:3000/user';

  constructor(private http: HttpClient) {}

  /**
   * Método para registrar un nuevo usuario.
   *
   * @param formData - Datos del usuario a registrar.
   * @returns Un observable con la respuesta del servidor al registro.
   */
  registerUser(formData: RegistrationData): Observable<RegistrationResponse> {
    return this.http.post<RegistrationResponse>(
      `${this.apiUrl}/register`,
      formData
    );
  }

  /**
   * Método para comprobar si un nombre de usuario ya está en uso.
   *
   * @param username - Nombre de usuario a verificar.
   * @returns Un observable con la respuesta del servidor indicando si el nombre de usuario ya existe o no.
   */
  checkUsername(username: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/check-username`, { username });
  }

  /**
   * Método para comprobar si un email ya está en uso.
   *
   * @param email - Email a verificar.
   * @returns Un observable con la respuesta del servidor indicando si el email ya existe o no.
   */
  checkEmail(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/check-email`, { email: email });
  }

  loginUser(credentials: LoginData): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
  }

  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  logoutUser(): void {
    localStorage.removeItem('authToken');
  }
}
