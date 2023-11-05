import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  AsyncValidatorFn,
} from '@angular/forms';
import { Router } from '@angular/router';

import { UserService } from 'src/app/services/user.service';
import { RegistrationData } from 'src/app/models/user.model';

import Swal from 'sweetalert2';

import { Subject, Observable, of } from 'rxjs';
import { takeUntil, map, catchError } from 'rxjs/operators';

import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  ngOnInit() {
    // Inicialización del formulario de registro con validaciones.
    this.registerForm = this.formBuilder.group(
      {
        first_name: ['', [Validators.required, this.noNumberValidator]],

        last_name: ['', [Validators.required, this.noNumberValidator]],

        email: [
          '',
          [Validators.required, Validators.email],
          this.emailTakenValidator(this.userService),
        ],

        username: [
          '',
          Validators.required,
          this.usernameTakenValidator(this.userService),
        ],

        birth_date: ['', [Validators.required, this.dateNotInFutureValidator]],

        // Campo para la contraseña con validaciones requeridas, y un patrón específico.
        // El patrón requiere:
        // - Al menos 1 letra minúscula
        // - Al menos 1 letra mayúscula
        // - Al menos 1 número
        // - Al menos 1 carácter especial de este conjunto (@$!%?&)
        // - Una longitud de entre 8 y 16 caracteres.
        password: [
          '',
          [
            Validators.required,
            Validators.pattern(
              '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%?&])[A-Za-z\\d@$!%?&]{8,16}$'
            ),
          ],
        ],

        confirmPassword: ['', Validators.required],
      },
      {
        validator: this.passwordsMatchValidator,
      }
    );
  }

  /**
   * Validador que asegura que el valor ingresado no contenga números.
   *
   * @param control - Control del formulario a validar.
   * @returns - Objeto de errores o null.
   */
  noNumberValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    const value = control.value;

    if (/\d/.test(value)) {
      return { hasNumber: true };
    }

    return null;
  }

  /**
   * Validador asíncrono para verificar si un nombre de usuario ya está tomado.
   *
   * @param userService - Servicio para verificar el nombre de usuario.
   * @returns - Función de validación asíncrona.
   */
  usernameTakenValidator(userService: UserService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return userService.checkUsername(control.value).pipe(
        map((res) => (res.exists ? { usernameTaken: true } : null)),
        catchError(() => of(null))
      );
    };
  }

  /**
   * Validador asíncrono que verifica si el email ya está registrado.
   *
   * @param userService - Servicio para verificar la existencia del email.
   * @returns - Función de validación asíncrona.
   */
  emailTakenValidator(userService: UserService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      return userService.checkEmail(control.value).pipe(
        map((response) => {
          return response.exists ? { emailTaken: true } : null;
        }),
        catchError(() => of(null))
      );
    };
  }

  /**
   * Validador que verifica si la contraseña y su confirmación son iguales.
   *
   * @param control - Grupo de controles del formulario.
   * @returns - Objeto de errores si las contraseñas no coinciden, de lo contrario, null.
   */
  passwordsMatchValidator(control: FormGroup): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password?.value !== confirmPassword?.value) {
      return { passwordsDontMatch: true };
    }
    return null;
  }

  /**
   * Validador que asegura que la fecha seleccionada no esté en el futuro.
   *
   * @param control - Control del formulario con la fecha a validar.
   * @returns - Objeto de errores si la fecha está en el futuro, de lo contrario, null.
   */
  dateNotInFutureValidator(control: AbstractControl): ValidationErrors | null {
    const selectedDate = new Date(control.value);
    const today = new Date();

    if (selectedDate > today) {
      return { futureDate: true };
    }
    return null;
  }

  /**
   * Método para remover el backdrop de Bootstrap. Esto se usa normalmente
   * para limpiar el overlay oscuro detrás de modales al cerrar un modal
   * de Bootstrap.
   */
  removeBootstrapBackdrop() {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
    document.body.style.overflow = 'auto';
  }

  /**
   * Intenta iniciar sesión automáticamente usando los datos proporcionados de un formulario de registro.
   * Esta función se usa después de que un usuario se haya registrado con éxito, para iniciar sesión automáticamente.
   *
   * @param formData - Los datos del formulario de registro, que contienen el nombre de usuario y la contraseña.
   */
  autoLogin(formData: RegistrationData) {
    const LoginData = {
      username: formData.username,
      password: formData.password,
    };

    this.userService.loginUser(LoginData).subscribe({
      next: (response) => {
        if (response && response.success) {
          if (response.token) {
            localStorage.setItem('authToken', response.token);
            localStorage.setItem('tokenExpiry', response.expiresAt.toString());
            const decodedToken: any = jwtDecode(response.token!);
            localStorage.setItem('userType', decodedToken.user_type);
            localStorage.setItem('username', decodedToken.username);

            this.router.navigate(['/home']);
          } else {
            Swal.fire('Error', 'No se recibió el token del servidor', 'error');
          }
        } else {
          Swal.fire(
            'Error',
            'Error al iniciar sesión automáticamente',
            'error'
          );
        }
      },
      error: (error) => {
        console.error('Error al iniciar sesión automáticamente:', error);
        Swal.fire('Error', 'Error al iniciar sesión automáticamente', 'error');
      },
    });
  }

  /**
   * Envía la solicitud de registro si el formulario es válido.
   */
  onSubmit() {
    if (this.registerForm.valid) {
      const formData: RegistrationData = this.registerForm.value;

      this.userService
        .registerUser(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              Swal.fire({
                title: '¡Éxito!',
                text: 'Registro exitoso. Iniciando sesión...',
                icon: 'success',
                iconColor: '#A8FF44',
                confirmButtonColor: '#00BCD4',
                didClose: () => {
                  this.removeBootstrapBackdrop();
                  // Realiza el login automático.
                  this.autoLogin(formData);
                },
              });
            } else if (response.error) {
              Swal.fire({
                title: 'Error',
                text: response.error,
                icon: 'error',
                didClose: () => {
                  this.removeBootstrapBackdrop();
                },
              });
            }
          },
          error: (error) => {
            console.error('Error al registrar usuario:', error);
            Swal.fire({
              title: 'Error',
              text: 'Ocurrió un error inesperado. Intente de nuevo.',
              icon: 'error',
            });
          },
        });
    } else {
      Swal.fire({
        title: 'Advertencia',
        text: 'Por favor, verifique todos los campos del formulario.',
        icon: 'warning',
        confirmButtonColor: '#00BCD4',
        iconColor: '#FFD83D',
      });
    }
  }
}
