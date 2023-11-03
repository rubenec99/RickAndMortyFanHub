import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { LoginData } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';

import Swal from 'sweetalert2';

import { jwtDecode } from 'jwt-decode';

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

  /**
   * Elimina el fondo opaco de Bootstrap que puede permanecer
   * después de cerrar un modal.
   */
  removeBootstrapBackdrop() {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
    document.body.style.overflow = 'auto';
  }

  constructor(private userService: UserService, private router: Router) {}

  /**
   * Método que maneja el evento de inicio de sesión.
   *
   * @param event - Evento del formulario para prevenir su envío por defecto.
   */
  onLogin(event: Event) {
    event.preventDefault();
    this.userService.loginUser(this.loginData).subscribe(
      (response) => {
        if (response.success) {
          this.userService.setToken(response.token!);

          // Decodificar el token para obtener el user_type
          const decodedToken: any = jwtDecode(response.token!);
          localStorage.setItem('userType', decodedToken.user_type);

          const expiryTime = new Date().getTime() + 3600 * 1000; // Tiempo actual + 1 hora (en milisegundos)
          localStorage.setItem('tokenExpiry', expiryTime.toString());

          Swal.fire({
            title: '¡Bienvenido!',
            text: 'Has iniciado sesión correctamente.',
            icon: 'success',
            iconColor: '#A8FF44',
            confirmButtonColor: '#00BCD4',
          }).then(() => {
            this.router.navigate(['/characters']);
            this.removeBootstrapBackdrop();
          });
        } else if (response.error) {
          Swal.fire({
            title: '¡Error!',
            text: 'Usuario o contraseña incorrectos',
            icon: 'error',
            iconColor: '#FF4565',
            confirmButtonColor: '#00BCD4',
          });
        }
      },
      (error) => {
        console.error('Error al iniciar sesión:', error);
        Swal.fire({
          title: '¡Error!',
          text: 'Usuario o contraseña incorrectos',
          icon: 'error',
          iconColor: '#FF4565',
          confirmButtonColor: '#00BCD4',
        });
      }
    );
  }
}
