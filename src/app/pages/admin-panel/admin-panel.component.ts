import { Component } from '@angular/core';

import { User } from 'src/backend/models/user.model';

import { UserService } from 'src/app/services/user.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css'],
})
export class AdminPanelComponent {
  users: User[] = []; // Lista para almacenar los usuarios que se obtienen.
  currentSorting: string = ''; // Propiedad que indica la columna actual utilizada para el ordenamiento.

  // Indica si el ordenamiento es en dirección ascendente o no.
  // Verdadero indica orden ascendente, falso indica orden descendente.
  isAscending: boolean = true;

  // Mapa para almacenar tipos originales de usuario.
  // La clave es un número (posiblemente el ID del tipo de usuario) y el valor es el nombre del tipo.
  originalUserTypes: Map<number, string> = new Map();

  // Página actual que se está visualizando o solicitando.
  currentPage: number = 0;

  // Cantidad de usuarios que se mostrarán por página.
  pageSize: number = 10;

  // Número total de usuarios en el conjunto de datos o en la base de datos.
  totalUsers: number = 0;

  constructor(private userService: UserService) {}

  /**
   * Obtiene la lista de usuarios y almacena los tipos de usuario originales.
   */
  ngOnInit(): void {
    this.userService.getAllUsers().subscribe(
      (response) => {
        // Cuando se recibe la lista de usuarios con éxito, se asigna a la propiedad "users".
        this.users = response.data;
        this.totalUsers = response.total; // También almacenamos el total de usuarios.

        // Se itera sobre los usuarios para almacenar sus tipos de usuario originales.
        // Esto se hace para poder verificar si ha habido cambios en el tipo de usuario más adelante.
        this.users.forEach((user) => {
          this.originalUserTypes.set(user.id, user.user_type);
        });
      },
      (error) => {
        console.error('Error obteniendo usuarios:', error);
      }
    );
  }

  /**
   * Método para cargar la lista de usuarios desde el servicio.
   */
  loadUsers(
    page: number = this.currentPage,
    limit: number = this.pageSize,
    sortBy: string = this.currentSorting,
    direction: string = this.isAscending ? 'ASC' : 'DESC'
  ): void {
    this.userService.getAllUsers(page, limit, sortBy, direction).subscribe(
      (response) => {
        this.users = response.data;
        this.totalUsers = response.total;

        // Limpiar el originalUserTypes
        this.originalUserTypes.clear();

        // Actualizar el originalUserTypes con los nuevos usuarios
        this.users.forEach((user) => {
          this.originalUserTypes.set(user.id, user.user_type);
        });
      },
      (error) => {
        console.error('Error obteniendo usuarios:', error);
      }
    );
  }

  get totalPages(): number {
    return Math.ceil(this.totalUsers / this.pageSize);
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadUsers(); // cargar la página seleccionada
    }
  }

  get hasNextPage(): boolean {
    return this.currentPage < this.totalPages - 1;
  }
  /**
   * Método para actualizar el tipo de usuario y gestionar la respuesta.
   *
   * @param userId El ID del usuario cuyo tipo se actualizará.
   * @param newUserType El nuevo tipo de usuario que se asignará.
   */
  updateUserType(userId: number, newUserType: string): void {
    // Llama al servicio para cambiar el tipo de usuario.
    this.userService.changeUserType(userId, newUserType).subscribe(
      (response) => {
        console.log('Tipo de usuario actualizado correctamente.');

        // Actualiza el valor original del tipo de usuario para el usuario recién actualizado.
        this.originalUserTypes.set(userId, newUserType);

        // Recarga la lista de usuarios después de la actualización.
        this.loadUsers();
      },
      (error) => {
        console.error('Hubo un error al actualizar el tipo de usuario.', error);
      }
    );
  }

  /**
   * Método para mostrar una confirmación antes de cambiar el tipo de usuario.
   *
   * @param userId El ID del usuario que se va a actualizar.
   * @param newUserType El nuevo tipo de usuario que se asignará.
   */
  confirmUpdate(userId: number, newUserType: string): void {
    Swal.fire({
      title: 'Confirmación',
      text: '¿Estás seguro de que deseas cambiar el tipo de usuario?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
      iconColor: '#FFD83D',
      cancelButtonColor: '#1F1F2E',
      confirmButtonColor: '#FFD83D',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Actualizado',
          text: 'Los permisos han sido actualizados correctamente.',
          icon: 'warning',
          iconColor: '#FFD83D',
          confirmButtonColor: '#00BCD4',
        });
        this.updateUserType(userId, newUserType);
      }
    });
  }

  /**
   * Método para eliminar un usuario por su ID.
   *
   * @param userId El ID del usuario que se desea eliminar.
   */
  deleteUser(userId: number): void {
    this.userService.deleteUser(userId).subscribe(
      (response) => {
        Swal.fire({
          title: 'Eliminado',
          text: 'El usuario ha sido eliminado correctamente.',
          icon: 'warning',
          iconColor: '#FFD83D',
          confirmButtonColor: '#00BCD4',
        });

        // Recarga la lista de usuarios después de la eliminación.
        this.loadUsers();
      },
      (error) => {
        Swal.fire('Error', 'Hubo un error al eliminar el usuario.', 'error');
      }
    );
  }

  /**
   * Método para mostrar una confirmación antes de eliminar un usuario.
   *
   * @param userId El ID del usuario que se desea eliminar.
   */
  confirmDelete(userId: number): void {
    Swal.fire({
      title: 'Confirmación',
      text: '¿Estás seguro de que deseas eliminar este usuario?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      iconColor: '#FFD83D',
      cancelButtonColor: '#1F1F2E',
      confirmButtonColor: '#FF4565',
    }).then((result) => {
      // Verifica si el usuario confirmó la eliminación.
      if (result.isConfirmed) {
        // Llama al método para eliminar el usuario.
        this.deleteUser(userId);
      }
    });
  }

  /**
   * Método para eliminar los usuarios seleccionados.
   * Obtiene los usuarios seleccionados, muestra una confirmación al usuario y luego
   * elimina los usuarios seleccionados si se confirma.
   */
  deleteSelectedUsers(): void {
    // Filtra los usuarios que están seleccionados.
    const selectedUsers = this.users.filter((user) => user.isSelected);

    // Obtiene los IDs de los usuarios seleccionados.
    const selectedUserIds = selectedUsers.map((user) => user.id);

    if (selectedUserIds.length === 0) {
      // Muestra una alerta informativa si no se selecciona ningún usuario.
      Swal.fire({
        title: 'No hay usuarios seleccionados',
        text: 'Por favor, selecciona usuarios para eliminar.',
        icon: 'info',
        confirmButtonText: 'OK',
        background: '#FFFFFF',
        confirmButtonColor: '#00BCD4',
        iconColor: '#00BCD4',
      });
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará los usuarios seleccionados.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      iconColor: '#FFD83D',
      cancelButtonColor: '#1F1F2E',
      confirmButtonColor: '#FF4565',
    }).then((result) => {
      if (result.isConfirmed) {
        // Si se confirma la eliminación, llama al servicio para eliminar los usuarios seleccionados.
        this.userService.deleteMultipleUsers(selectedUserIds).subscribe(
          (response) => {
            // Después de la eliminación, recarga la lista de usuarios.
            this.loadUsers();
            Swal.fire({
              title: 'Eliminados',
              text: 'Los usuarios seleccionados han sido eliminados correctamente.',
              icon: 'warning',
              iconColor: '#FFD83D',
              confirmButtonColor: '#00BCD4',
            });
          },
          (error) => {
            Swal.fire(
              'Error',
              'Ocurrió un error al eliminar los usuarios.',
              'error'
            );
          }
        );
      }
    });
  }

  /**
   * Método que verifica si el tipo de usuario ha cambiado para un usuario específico.
   * Compara el tipo de usuario actual con el tipo de usuario original almacenado en el mapa
   * `originalUserTypes` y devuelve `true` si ha cambiado y `false` si es igual al tipo original.
   *
   * @param user El usuario para el que se verificará si ha cambiado el tipo de usuario.
   * @returns `true` si el tipo de usuario ha cambiado, `false` si es igual al tipo original.
   */
  hasUserTypeChanged(user: User): boolean {
    // Obtiene el tipo de usuario original del mapa originalUserTypes.
    const original = this.originalUserTypes.get(user.id);

    // Compara el tipo de usuario actual con el tipo de usuario original y devuelve el resultado.
    return user.user_type !== original;
  }

  toggleSort(sorting: string): void {
    if (this.currentSorting === sorting) {
      this.isAscending = !this.isAscending;
    } else {
      this.currentSorting = sorting;
      this.isAscending = true; // Por defecto, establecer el orden ascendente al cambiar de columna
    }

    if (sorting === 'user_type') {
      this.users.sort((a, b) =>
        this.isAscending
          ? a.user_type.localeCompare(b.user_type)
          : b.user_type.localeCompare(a.user_type)
      );
    } else {
      this.loadUsers(
        this.currentPage,
        this.pageSize,
        this.currentSorting,
        this.isAscending ? 'ASC' : 'DESC'
      );
    }
  }
}
