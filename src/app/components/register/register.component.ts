import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

import { RegistrationData } from 'src/app/models/user.model';

import { UserService } from 'src/app/services/user.service';

import { Subject, Observable } from 'rxjs';
import {
  takeUntil,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  first,
} from 'rxjs/operators';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit, OnDestroy {
  registerForm!: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  /**
   * Inicializa el componente y crea el formulario de registro con sus respectivas validaciones.
   */
  ngOnInit() {
    // Inicialización del formulario de registro con validaciones.
    this.registerForm = this.formBuilder.group(
      {
        first_name: ['', [Validators.required, this.noNumberValidator]],

        last_name: ['', [Validators.required, this.noNumberValidator]],

        email: [
          '',
          [Validators.required, Validators.email], // Validadores síncronos
          this.emailTakenValidator.bind(this), // Validador asíncrono
        ],

        username: [
          '',
          [Validators.required, Validators.minLength(3)], // Sincronous validators here
          this.usernameTakenValidator.bind(this), // Async validator here
        ],

        birth_date: ['', [Validators.required, this.dateNotInFutureValidator]],

        /**
         * Campo para la contraseña con validaciones requeridas, y un patrón específico.
         * El patrón requiere:
         * - Al menos 1 letra minúscula
         * - Al menos 1 letra mayúscula
         * - Al menos 1 número
         * - Al menos 1 carácter especial de este conjunto (@$!%?&)
         * - Una longitud de entre 8 y 16 caracteres.
         */
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
        termsCheckbox: [false, Validators.requiredTrue],
      },
      {
        validator: this.passwordsMatchValidator,
      }
    );
  }

  /**
   * Se encarga de emitir un valor y luego completar el subject `destroy$` para
   * efectuar una limpieza y evitar fugas de memoria por suscripciones no cerradas.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Validador que asegura que el valor ingresado no contenga números.
   *
   * @param control Control del formulario a validar.
   * @returns Un objeto de errores o null.
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
   * Crea un validador asíncrono que verifica si un nombre de usuario ya ocupado.
   * Utiliza `valueChanges` del control para reaccionar a cada cambio con un retraso
   * y sin repetir valores idénticos consecutivos para reducir las solicitudes innecesarias.
   *
   * @param control El control de formulario AbstractControl que contiene el valor del nombre de usuario.
   * @returns Un Observable que emite un objeto de errores de validación si el nombre de usuario
   *          está tomado, o `null` si no hay errores.
   */
  usernameTakenValidator(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    return control.valueChanges.pipe(
      debounceTime(500), // Espera 500ms
      distinctUntilChanged(),
      switchMap((value) => this.userService.checkUsernameTaken(value)),
      first() // Completa el observable después de la primera respuesta recibida
    );
  }

  /**
   * Implementa un validador asíncrono que determina si el correo electrónico ya ha sido registrado.
   * Este método se basa en el operador `valueChanges` del control para emitir el valor del campo
   * y verificar su disponibilidad, minimizando las solicitudes a través de técnicas reactivas.
   *
   * @param control El control del formulario AbstractControl que contiene el valor del campo de correo electrónico.
   * @returns Un Observable que emite un objeto de errores de validación si el correo electrónico
   *          ya está registrado, o `null` si está disponible.
   */
  emailTakenValidator(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    return control.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      switchMap((value) => this.userService.checkEmailTaken(value)),
      first()
    );
  }

  /**
   * Validador que verifica si la contraseña y su confirmación son iguales.
   *
   * @param control - Grupo de controles del formulario.
   * @returns Un objeto de errores si las contraseñas no coinciden, de lo contrario, null.
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
   * @param control Control del formulario con la fecha a validar.
   * @returns Objeto de errores si la fecha está en el futuro, de lo contrario, null.
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
   * Método para remover el backdrop de Bootstrap.
   */
  removeBootstrapBackdrop() {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
    document.body.style.overflow = 'auto';
  }

  /**
   * Realiza un inicio de sesión automático utilizando los datos de registro del usuario.
   *
   * Este método toma los datos de registro del usuario, crea un objeto de datos de inicio de sesión
   * y luego utiliza el servicio de usuario para intentar iniciar sesión automáticamente.
   * Si el inicio de sesión es exitoso y se recibe un token, almacena la información relevante del usuario
   * en localStorage y redirige a la página de inicio. Si hay un error (como la falta de un token o un fallo en la respuesta),
   * muestra un mensaje de error correspondiente.
   *
   * @param {RegistrationData} formData - Los datos del formulario de registro del usuario.
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
            localStorage.setItem('userType', response.user_type);
            localStorage.setItem('username', response.username);
            localStorage.setItem('user_id', response.user_id);
            localStorage.setItem('tokenExpiry', response.expiresAt.toString());

            this.router.navigate(['/home']);
          } else {
            Swal.fire({
              title: '¡Error!',
              text: 'Error, no se recibió el token del servidor. Por favor, inténtelo de nuevo más tarde.',
              icon: 'error',
              iconColor: '#FF4565',
              confirmButtonColor: '#00BCD4',
            });
          }
        } else {
          Swal.fire({
            title: '¡Error!',
            text: 'Error al iniciar sesión automáticamente. Por favor, inténtelo de nuevo más tarde.',
            icon: 'error',
            iconColor: '#FF4565',
            confirmButtonColor: '#00BCD4',
          });
        }
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
                iconColor: '#FF4565',
                confirmButtonColor: '#00BCD4',
                didClose: () => {
                  this.removeBootstrapBackdrop();
                },
              });
            }
          },
          error: (err) => {
            Swal.fire({
              title: '¡Error!',
              text: 'Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.',
              icon: 'error',
              iconColor: '#FF4565',
              confirmButtonColor: '#00BCD4',
            });
          },
        });
    } else {
      Swal.fire({
        title: 'Atención',
        text: 'Revisa todos los campos del formulario.',
        icon: 'warning',
        confirmButtonText: 'OK',
        background: '#FFFFFF',
        confirmButtonColor: '#00BCD4',
        iconColor: '#FFD83D',
      });
    }
  }
}
