import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

import { User } from 'src/app/models/user.model';

import { UserService } from 'src/app/services/user.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
})
export class EditProfileComponent implements OnInit {
  user: User | null = null; // Datos del usuario actual.
  editProfileForm!: FormGroup; // Formulario reactivo.
  showPasswordFields = false; // Determina si se muestran o no los campos de contraseña en el formulario.

  passwordType = 'password';
  confirmPasswordType = 'password';
  showIconPassword = false;
  showIconConfirmPassword = false;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  /**
   * Inicialización del componente.
   * Se encarga de inicializar el formulario de edición y de cargar los datos actuales del usuario.
   */
  ngOnInit(): void {
    this.editProfileForm = this.fb.group(
      {
        first_name: ['', [Validators.required, this.noNumberValidator]],
        last_name: ['', [Validators.required, this.noNumberValidator]],
        email: [{ value: '', disabled: true }, Validators.required],
        username: [{ value: '', disabled: true }, Validators.required],
        password: [
          '',
          [
            Validators.pattern(
              '^(?=.*\\d)(?=.*[\\u0021-\\u002b\\u003c-\\u0040.,_-])(?=.*[A-Z])(?=.*[a-z])\\S{8,16}$'
            ),
          ],
        ],
        confirmPassword: [''],
        birth_date: ['', [Validators.required, this.dateNotInFutureValidator]],
      },
      {
        validator: this.passwordsMatchValidator,
      }
    );

    // Obtiene y carga los datos del perfil del usuario actual.
    this.fetchUserProfile();
  }

  /**
   * Recupera el perfil del usuario actual del servidor y lo almacena
   * en la variable de instancia `this.user`.
   *
   * Si el usuario tiene una fecha de nacimiento definida, esta fecha se
   * formateará al formato YYYY-MM-DD para facilitar su visualización y manipulación.
   */
  fetchUserProfile(): void {
    this.userService.getProfile().subscribe((response) => {
      this.user = response;
      if (this.user.birth_date) {
        this.user.birth_date = this.getFormattedDate(this.user.birth_date);
      }
      this.editProfileForm.patchValue(this.user);
    });
  }

  /**
   * Convierte una cadena que representa una fecha en formato ISO (por ejemplo, 2023-04-23T17:00:00.000Z)
   * a una cadena en formato YYYY-MM-DD (por ejemplo, 2023-04-23).
   *
   * @param {string} dateString - La cadena que representa una fecha en formato ISO.
   * @returns {string} La fecha en formato YYYY-MM-DD.
   */
  getFormattedDate(dateString: string): string {
    if (dateString) {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = ('0' + (date.getMonth() + 1)).slice(-2); // Sumamos 1 porque getMonth() es 0-indexado
      const day = ('0' + date.getDate()).slice(-2);

      return `${year}-${month}-${day}`;
    }
    return '';
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
   * Alterna la visibilidad de los campos de contraseña en la UI.
   *
   * Si los campos de contraseña están actualmente visibles, los ocultará,
   * y viceversa.
   */
  togglePasswordFields(): void {
    this.showPasswordFields = !this.showPasswordFields;
  }

  /**
   * Validador que verifica si la contraseña y su confirmación son iguales.
   *
   * @param control - Grupo de controles del formulario.
   * @returns - Objeto de errores si las contraseñas no coinciden o están vacías, de lo contrario, null.
   */
  passwordsMatchValidator(control: FormGroup): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (
      (password?.value || confirmPassword?.value) &&
      password?.value !== confirmPassword?.value
    ) {
      return { passwordsDontMatch: true };
    }
    return null;
  }

  /**
   * Gestiona el envío del formulario de edición del perfil.
   *
   * Si el formulario es válido, procede a realizar la actualización del perfil.
   * Considera las siguientes validaciones:
   * - Si el campo contraseña está vacío, no se envían campos relacionados con la contraseña.
   * - Si la contraseña y su confirmación no coinciden, muestra un error.
   * Luego, intenta actualizar el perfil utilizando el servicio `userService`.
   * Si la actualización es exitosa, redirige al usuario a la página de inicio.
   */
  onSubmit(): void {
    if (this.editProfileForm.valid) {
      const updatedProfile = this.editProfileForm.value;

      if (this.user && this.user.id) {
        updatedProfile.id = this.user.id;
      }

      if (!updatedProfile.password) {
        delete updatedProfile.password;
        delete updatedProfile.confirmPassword;
      } else {
        if (updatedProfile.password !== updatedProfile.confirmPassword) {
          Swal.fire({
            title: '¡Error!',
            text: 'La contraseña y su confirmación no coinciden.',
            icon: 'error',
            iconColor: '#FF4565',
            confirmButtonColor: '#00BCD4',
          });
          return;
        }
        delete updatedProfile.confirmPassword;
      }

      this.userService.updateProfile(updatedProfile).subscribe({
        next: () => {
          Swal.fire({
            title: 'Éxito',
            text: 'Perfil actualizado con éxito.',
            icon: 'success',
            confirmButtonColor: '#00BCD4',
            iconColor: '#A8FF44',
          }).then(() => this.router.navigate(['/home']));
        },
        error: () => {
          Swal.fire({
            title: '¡Error!',
            text: 'Error actualizar el perfil. Por favor, inténtelo de nuevo más tarde.',
            icon: 'error',
            iconColor: '#FF4565',
            confirmButtonColor: '#00BCD4',
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

  /**
   * Gestiona el proceso de eliminación del perfil del usuario.
   *
   * Solicita confirmación al usuario antes de continuar.
   * Si el usuario confirma, intenta eliminar el perfil utilizando el servicio `userService`.
   * Si la eliminación es exitosa, desloguea al usuario y lo redirige a la página de inicio.
   */
  onDeleteProfile(): void {
    if (!this.user || this.user.id === undefined) {
      Swal.fire({
        title: '¡Error!',
        text: 'Error al identificar al usuario. Por favor, inténtelo de nuevo más tarde.',
        icon: 'error',
        iconColor: '#FF4565',
        confirmButtonColor: '#00BCD4',
      });
      return;
    }

    Swal.fire({
      title: 'Confirmación',
      text: '¿Estás seguro de que deseas eliminar tu perfil? Esta acción es irreversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      background: '#FFFFFF',
      confirmButtonColor: '#FF4565',
      cancelButtonColor: '#1F1F2E',
      iconColor: '#FFD83D',
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.user && typeof this.user.id !== 'undefined') {
          this.userService.deleteUser(this.user.id).subscribe({
            next: () => {
              Swal.fire({
                title: 'Eliminado',
                text: 'Perfil eliminado correctamente.',
                icon: 'success',
                confirmButtonColor: '#00BCD4',
                iconColor: '#A8FF44',
              }).then(() => {
                this.userService.logoutUser();
                this.router.navigate(['/home']);
              });
            },
            error: () => {
              Swal.fire({
                title: '¡Error!',
                text: 'Error al eliminar el perfil. Por favor, inténtelo de nuevo más tarde.',
                icon: 'error',
                iconColor: '#FF4565',
                confirmButtonColor: '#00BCD4',
              });
            },
          });
        }
      }
    });
  }

  /** Cambia la visibilidad de la contraseña y el tipo de entrada entre 'password' y 'text'. */
  togglePasswordVisibility() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }

  /** Cambia la visibilidad de la confirmación de contraseña y el tipo de entrada entre 'password' y 'text'. */
  toggleConfirmPasswordVisibility() {
    this.confirmPasswordType =
      this.confirmPasswordType === 'password' ? 'text' : 'password';
  }

  /** Alterna la visibilidad del ícono de ojo en el campo de contraseña. */
  toggleIconPassword() {
    this.showIconPassword = !this.showIconPassword;
  }

  /** Alterna la visibilidad del ícono de ojo en el campo de confirmación de contraseña. */
  toggleIconConfirmPassword() {
    this.showIconConfirmPassword = !this.showIconConfirmPassword;
  }
}
