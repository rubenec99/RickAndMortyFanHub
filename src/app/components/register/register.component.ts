import { Component, OnInit } from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  AsyncValidatorFn,
} from '@angular/forms';

import { UserService } from 'src/app/services/user.service';

import { RegistrationData } from 'src/app/models/user.model';

import { Subject, Observable, of } from 'rxjs';
import { takeUntil, map, catchError } from 'rxjs/operators';

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
    private formBuilder: FormBuilder
  ) {}

  // Variable para gestionar las toasts
  toastMessages: string[] = [];
  show = false;

  /**
   * Método del ciclo de vida de Angular que se ejecuta al inicializar el componente.
   */
  ngOnInit() {
    // Inicialización del formulario 'registerForm' utilizando FormBuilder.
    this.registerForm = this.formBuilder.group(
      {
        // Campo para el primer nombre con validaciones requeridas y sin números.
        first_name: [
          '', // Valor inicial vacío.
          [Validators.required, this.noNumberValidator], // Array de validaciones.
        ],

        // Campo para el apellido con validaciones requeridas y sin números.
        last_name: ['', [Validators.required, this.noNumberValidator]],

        // Campo para el correo electrónico con validaciones requeridas, formato de correo
        // y comprobación de disponibilidad del correo.
        email: [
          '',
          [Validators.required, Validators.email], // Validaciones básicas.
          this.emailTakenValidator(this.userService), // Validador asíncrono para verificar si el correo ya existe.
        ],

        // Campo para el nombre de usuario con validaciones requeridas
        // y comprobación de disponibilidad del nombre de usuario.
        username: [
          '',
          Validators.required,
          this.usernameTakenValidator(this.userService),
        ],

        // Campo para la fecha de nacimiento con validaciones requeridas y fecha no futura.
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

        // Campo para confirmar la contraseña, solo se requiere que esté presente.
        confirmPassword: ['', Validators.required],
      },
      {
        // Validador adicional al nivel de grupo para asegurarse de que la contraseña
        // y la confirmación de la contraseña coincidan.
        validator: this.passwordsMatchValidator,
      }
    );
  }

  /**
   * Validador personalizado para verificar que un control no contenga números.
   *
   * @param control - El control a ser validado.
   *
   * @returns Un objeto con un error si el control contiene números, o 'null' si es válido.
   */
  noNumberValidator(
    control: AbstractControl
  ): { [key: string]: boolean } | null {
    // Obtener el valor del control.
    const value = control.value;

    // Verificar si el valor contiene algún número.
    if (/\d/.test(value)) {
      return { hasNumber: true };
    }

    return null;
  }

  /**
   * Validador asíncrono que verifica si un nombre de usuario ya ha sido tomado.
   *
   * Este validador utiliza el servicio `UserService` para hacer una verificación asíncrona
   * y determinar si el nombre de usuario ya está en uso.
   *
   * @param userService - Servicio utilizado para comprobar la disponibilidad del nombre de usuario.
   *
   * @returns Una función de validador asíncrono que devuelve un observable. El observable emitirá
   *          un objeto de error si el nombre de usuario ya está tomado, o 'null' si el nombre de usuario
   *          está disponible o si ocurre algún error durante la verificación.
   */
  usernameTakenValidator(userService: UserService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      // Utilizar el servicio para comprobar si el nombre de usuario ya ha sido tomado.
      return userService.checkUsername(control.value).pipe(
        map((res) => (res.exists ? { usernameTaken: true } : null)),
        catchError(() => of(null))
      );
    };
  }

  /**
   * Validador asíncrono que verifica si un correo electrónico ya ha sido registrado.
   *
   * Este validador utiliza el servicio `UserService` para realizar una verificación asíncrona
   * y determinar si el correo electrónico ya está en uso.
   *
   * @param userService - Servicio utilizado para verificar la disponibilidad del correo electrónico.
   *
   * @returns Una función de validador asíncrono que devuelve un observable. El observable emitirá
   *          un objeto de error si el correo electrónico ya está registrado, o 'null' si el correo
   *          electrónico está disponible o si ocurre algún error durante la verificación.
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
   * Validador que verifica si dos campos de contraseña en un formulario coinciden.
   *
   * Este validador compara los valores de los campos 'password' y 'confirmPassword' dentro
   * de un formulario para asegurarse de que ambos valores sean idénticos.
   *
   * @param control - El grupo de formulario que contiene ambos campos de contraseña.
   *
   * @returns Un objeto de error si las contraseñas no coinciden o 'null' si coinciden.
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
   * Validador que verifica si la fecha proporcionada no está en el futuro.
   *
   * Este validador se asegura de que la fecha ingresada por el usuario no sea
   * posterior a la fecha actual. Es útil, por ejemplo, para campos donde se espera
   * que el usuario ingrese una fecha de nacimiento o una fecha de evento que ya haya pasado.
   *
   * @param control - El control del formulario que contiene la fecha a validar.
   *
   * @returns Un objeto de error si la fecha es futura o 'null' si es una fecha pasada o presente.
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
   * Método que maneja el envío del formulario de registro.
   *
   * Este método se invoca cuando el usuario intenta enviar el formulario de registro.
   * Se realiza una serie de validaciones en el formulario y, si es válido, se procede
   * a registrar al usuario a través del servicio 'userService'. Los mensajes resultantes
   * (ya sean de éxito o error) se muestran al usuario a través de toasts.
   */
  onSubmit() {
    // Verificar si el formulario de registro es válido.
    if (this.registerForm.valid) {
      // Obtener los datos del formulario.
      const formData: RegistrationData = this.registerForm.value;

      // Llamar al método 'registerUser' del servicio 'userService' para registrar al usuario.
      this.userService
        .registerUser(formData)
        // Desubscribirse del observable cuando 'destroy$' emite un valor.
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (response) => {
            // Si la respuesta contiene un mensaje de éxito, mostrarlo.
            if (response.success) {
              this.toastMessages.push(response.success);
              this.show = true;
            }
            // Si la respuesta contiene un mensaje de error, mostrarlo.
            else if (response.error) {
              this.toastMessages.push(response.error);
              this.show = true;
            }
          },
          // En caso de error durante la llamada al servicio, registrar el error en la consola.
          (error) => {
            console.error('Error al registrar usuario:', error);
          }
        );
    } else {
      // Si el formulario no es válido, mostrar un mensaje genérico al usuario.
      this.toastMessages.push(
        'Por favor, complete todos los campos correctamente.'
      );
      this.show = true;
    }
  }

  // Método para cerrar toast
  closeToast() {
    this.show = false;
    this.toastMessages = [];
  }
}
