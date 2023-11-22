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

  passwordType = 'password';
  showIconPassword = false;

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
   *
   * Este método evita el comportamiento predeterminado del evento (para prevenir la recarga de la página),
   * y luego intenta iniciar sesión con los datos proporcionados por el usuario.
   * Si el inicio de sesión es exitoso, almacena varios datos del usuario en localStorage y muestra un mensaje de bienvenida.
   * Si el inicio de sesión falla debido a credenciales incorrectas o un error del servidor, muestra un mensaje de error.
   *
   * @param {Event} event - El evento de formulario que desencadena el inicio de sesión.
   */
  onLogin(event: Event) {
    event.preventDefault();
    this.userService.loginUser(this.loginData).subscribe({
      next: (response) => {
        if (response.success) {
          this.userService.setToken(response.token!);

          localStorage.setItem('userType', response.user_type);
          localStorage.setItem('username', response.username);
          localStorage.setItem('user_id', response.user_id);
          localStorage.setItem('tokenExpiry', response.expiresAt.toString());

          Swal.fire({
            title: '¡Bienvenid@!',
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

  /** Cambia la visibilidad de la contraseña y el tipo de entrada entre 'password' y 'text'. */
  togglePasswordVisibility() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  /** Alterna la visibilidad del ícono de ojo en el campo de contraseña. */
  toggleIconPassword() {
    this.showIconPassword = !this.showIconPassword;
  }
}
