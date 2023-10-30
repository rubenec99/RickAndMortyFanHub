import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';

import { User } from 'src/backend/models/user.model';

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

  /**
   * Realiza la petición de inicio de sesión al servidor.
   *
   * @param credentials - Datos de inicio de sesión del usuario que contiene el nombre de usuario y la contraseña.
   * @returns - Un observable con la respuesta del inicio de sesión.
   */
  loginUser(credentials: LoginData): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials);
  }

  /**
   * Almacena el token de autenticación en el almacenamiento local.
   *
   * @param token - Token de autenticación que se desea almacenar.
   */
  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  /**
   * Obtiene el token de autenticación del almacenamiento local.
   *
   * @returns - El token de autenticación si existe, de lo contrario retorna null.
   */
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  /**
   * Elimina el token de autenticación del almacenamiento local para cerrar sesión.
   */
  logoutUser(): void {
    localStorage.removeItem('authToken');
  }

  /**
   * Obtiene una lista de usuarios con base en ciertos parámetros de paginación y ordenamiento.
   *
   * @param {number} page - Número de página que se quiere consultar. Por defecto es 0.
   * @param {number} limit - Número máximo de usuarios a retornar por página. Por defecto es 15.
   * @param {string} sortBy - Campo por el cual se quiere ordenar la lista de usuarios. Por defecto es 'id'.
   * @param {string} direction - Dirección del ordenamiento: 'ASC' para ascendente y 'DESC' para descendente. Por defecto es 'ASC'.
   *
   * @returns {Observable<{ data: User[]; total: number }>} Un Observable que contiene un objeto con:
   *    - data: Un arreglo de usuarios.
   *    - total: El número total de usuarios que cumplen con el criterio de búsqueda.
   */
  getAllUsers(
    page: number = 0,
    limit: number = 15,
    sortBy: string = 'id',
    direction: string = 'ASC'
  ): Observable<{ data: User[]; total: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy)
      .set('direction', direction);

    return this.http.get<{ data: User[]; total: number }>(
      `${this.apiUrl}/all-users`,
      { params }
    );
  }

  /**
   * Cambia el tipo de usuario (normal o administrador) para un usuario específico.
   *
   * @param userId El ID del usuario cuyo tipo se va a cambiar.
   * @param newUserType El nuevo tipo de usuario ('normal' o 'admin').
   * @returns Un Observable que emite la respuesta del servidor.
   */
  changeUserType(userId: number, newUserType: string): Observable<any> {
    const url = 'http://localhost:3000/user/update-type';

    const body = {
      userId: userId,
      newUserType: newUserType,
    };

    return this.http.put(url, body);
  }

  /**
   * Elimina un usuario específico por su ID.
   *
   * @param userId El ID del usuario que se eliminará.
   * @returns Un Observable que emite la respuesta del servidor.
   */
  deleteUser(userId: number): Observable<any> {
    const url = `${this.apiUrl}/delete-user/${userId}`;

    return this.http.delete(url);
  }

  /**
   * Elimina múltiples usuarios basado en sus IDs.
   *
   * @param userIds Array de IDs de usuarios a eliminar.
   */
  deleteMultipleUsers(userIds: number[]): Observable<any> {
    const endpoint = `${this.apiUrl}/delete-multiple`;
    return this.http.post(endpoint, { userIds });
  }

  /**
   * Obtiene el tipo de usuario.
   *
   * Este método primero recupera el token de autenticación del usuario. Si no hay token,
   * se lanza un error. Si hay token, se incluye en los encabezados de la petición HTTP
   * y se realiza una petición GET al endpoint `/user-type` para obtener el tipo de usuario.
   *
   * @returns {Observable<{ user_type: string }>}
   *
   * @throws {Error}
   *
   */
  getUserType(): Observable<{ user_type: string }> {
    const token = this.getToken();

    if (!token) {
      // Aquí puedes manejar el caso en el que no haya token. Por ejemplo, lanzar un error.
      throw new Error('No token found');
    }

    const headers = new HttpHeaders().set('Authorization', token);

    return this.http.get<{ user_type: string }>(`${this.apiUrl}/user-type`, {
      headers,
    });
  }
}
