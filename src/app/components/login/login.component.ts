import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { LoginData } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';

import { jwtDecode } from 'jwt-decode';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  // Datos para iniciar sesión
  loginData: LoginData = {
    username: '',
    password: '',
  };

  constructor(private userService: UserService, private router: Router) {}

  /**
   * Elimina el backdrop de Bootstrap de la página y restaura el desplazamiento del cuerpo del documento.
   */
  removeBootstrapBackdrop() {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
    document.body.style.overflow = 'auto';
  }

  /**
   * Maneja el proceso de inicio de sesión del usuario.
   * Previene la acción por defecto del evento de envío para controlar manualmente el flujo.
   * Utiliza `userService` para enviar los datos de inicio de sesión al servidor y suscribirse a la respuesta.
   * En caso de éxito, almacena el token y los datos relevantes del usuario en `localStorage` y redirige a la página de inicio.
   * Si las credenciales son incorrectas, muestra una alerta con el error.
   * En caso de cualquier otro error en la petición, también se muestra una alerta.
   *
   * @param {Event} event El evento de envío del formulario de inicio de sesión.
   */
  onLogin(event: Event) {
    event.preventDefault();
    this.userService.loginUser(this.loginData).subscribe({
      next: (response) => {
        if (response.success) {
          this.userService.setToken(response.token!);

          // Decodificar el token para obtener el user_type
          const decodedToken: any = jwtDecode(response.token!);
          localStorage.setItem('userType', decodedToken.user_type);
          localStorage.setItem('username', decodedToken.username);
          localStorage.setItem('user_id', decodedToken.user_id);

          const expiryTime = new Date().getTime() + 3600 * 1000; // Tiempo actual + 1 hora (en milisegundos)
          localStorage.setItem('tokenExpiry', expiryTime.toString());

          Swal.fire({
            title: '¡Bienvenido!',
            text: 'Has iniciado sesión correctamente.',
            icon: 'success',
            iconColor: '#A8FF44',
            confirmButtonColor: '#00BCD4',
          }).then(() => {
            this.router.navigate(['/home']);
            this.removeBootstrapBackdrop();
          });
        } else if (response.error) {
          Swal.fire({
            title: '¡Error!',
            text: 'Usuario o contraseña incorrectos.',
            icon: 'error',
            iconColor: '#FF4565',
            confirmButtonColor: '#00BCD4',
          });
        }
      },
      error: () => {
        Swal.fire({
          title: '¡Error!',
          text: 'Usuario o contraseña incorrectos.',
          icon: 'error',
          iconColor: '#FF4565',
          confirmButtonColor: '#00BCD4',
        });
      },
    });
  }
}
