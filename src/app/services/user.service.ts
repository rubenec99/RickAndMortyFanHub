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
   * Recupera el token de autenticación del localStorage y verifica si ha expirado.
   *
   * @returns {string | null} - Devuelve el token de autenticación si es válido, o null si ha expirado o no está presente.
   */
  getToken(): string | null {
    const retrievedToken = localStorage.getItem('authToken');
    const expiry = localStorage.getItem('tokenExpiry');

    const currentTime = new Date().getTime();

    // Verificar si el token ha expirado comparando el tiempo actual con el tiempo de expiración del token.
    if (currentTime > Number(expiry)) {
      // Si el token ha expirado, cerrar la sesión del usuario y devolver null.
      this.logoutUser();
      return null;
    }

    // Si el token aún es válido, devolverlo.
    return retrievedToken;
  }

  /**
   * Cierra la sesión del usuario eliminando el token de autenticación y su tiempo de expiración del localStorage.
   */
  logoutUser(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('userType');
    localStorage.removeItem('username');
  }

  /**
   * Obtiene la fecha/hora de expiración del token de autenticación desde el localStorage.
   *
   * @returns {number | null} Retorna la fecha/hora de expiración del token en milisegundos desde
   *                          la época Unix (1 de enero de 1970) si está presente. Si no, retorna null.
   */
  getTokenExpiry(): number | null {
    const expiry = localStorage.getItem('tokenExpiry');

    // Convertir la fecha/hora de expiración a número y retornarla.
    // Si no se encuentra, retornar null.
    return expiry ? parseInt(expiry, 10) : null;
  }

  /**
   * Determina si el token de autenticación almacenado ha expirado.
   *
   * @returns {boolean} Retorna 'true' si el token ha expirado o no tiene fecha/hora de expiración.
   *                    Retorna 'false' si el token aún es válido.
   */
  tokenHasExpired(): boolean {
    const expiryTime = this.getTokenExpiry();

    // Si no hay fecha/hora de expiración, asumimos que el token ha expirado.
    if (!expiryTime) {
      return true;
    }

    const currentTime = new Date().getTime();

    // Si la fecha/hora actual es mayor que la fecha/hora de expiración del token,
    // significa que el token ha expirado.
    if (currentTime > expiryTime) {
      return true;
    }

    // Si ninguna de las condiciones anteriores se cumple, el token aún es válido.
    return false;
  }

  /**
   * Determina si un usuario está logueado basado en la presencia y validez del token de autenticación.
   *
   * @returns {boolean} Retorna 'true' si hay un token válido en el almacenamiento local, de lo contrario, 'false'.
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (token && !this.tokenHasExpired()) {
      return true;
    }
    return false;
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
    limit: number = 10,
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
   * Obtiene el tipo de usuario.
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

  /**
   * Solicita el perfil del usuario al servidor a través de una petición HTTP GET.
   *
   * @returns {Observable<User>} Retorna un Observable que emitirá el perfil del usuario
   *                             cuando se obtenga una respuesta del servidor.
   * @throws {Error} Si no se encuentra un token de autenticación en el almacenamiento local,
   *                 se lanza un error.
   */
  getProfile(): Observable<User> {
    let headers = new HttpHeaders();
    const token = this.getToken();

    // Si el token existe, agregarlo al encabezado 'Authorization' de la solicitud.
    if (token) {
      headers = headers.append('Authorization', token);
    } else {
      // Si no se encuentra un token, lanzar un error ya que es necesario para la solicitud.
      throw new Error('No authentication token found.');
    }

    return this.http.get<User>(`${this.apiUrl}/profile`, { headers });
  }

  /**
   * Actualiza el perfil del usuario en el servidor.
   *
   * @param {User} user - El perfil del usuario que se quiere actualizar.
   * @returns {Observable<any>} Retorna un Observable que emitirá la respuesta
   *                            del servidor tras la actualización.
   * @throws {Error} Si el token de autenticación no está disponible,
   *                 TypeScript generará un error de tiempo de compilación debido al operador '!'
   *                 (usado para asegurarse de que `getToken()` no devuelve null o undefined).
   */
  updateProfile(user: User): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: this.getToken()!,
    });

    return this.http.put(`${this.apiUrl}/update-profile`, user, { headers });
  }
}
