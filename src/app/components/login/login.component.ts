import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { LoginData } from 'src/app/models/user.model';
import { UserService } from 'src/app/services/user.service';
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

  /**
   * Elimina el fondo opaco de Bootstrap que puede permanecer
   * después de cerrar un modal.
   */
  removeBootstrapBackdrop() {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
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
          this.router.navigate(['/characters']);
          Swal.fire({
            title: '¡Bienvenido!',
            text: 'Has iniciado sesión correctamente.',
            icon: 'success',
            didClose: () => {
              this.removeBootstrapBackdrop();
            },
          });
        } else if (response.error) {
          Swal.fire({
            title: 'Error',
            text: 'Usuario o contraseña incorrectos.',
            icon: 'error',
          });
        }
      },
      (error) => {
        console.error('Error al iniciar sesión:', error);
        Swal.fire({
          title: 'Error',
          text: 'Usuario o contraseña incorrectos.',
          icon: 'error',
        });
      }
    );
  }
}
