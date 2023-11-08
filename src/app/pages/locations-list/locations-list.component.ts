import { Component, OnDestroy, OnInit } from '@angular/core';

import { Location } from 'src/app/models/location.model';
import { Character } from 'src/app/models/character.model';

import { LocationsService } from 'src/app/services/locations.service';
import { CharactersService } from 'src/app/services/characters.service';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-location-list',
  templateUrl: './locations-list.component.html',
  styleUrls: ['./locations-list.component.css'],
})
export class LocationsComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>(); // Instancia de Subject que emite un valor cuando es necesario desuscribirse de observables.

  locations: Location[] = []; // Array que almacena las localizaciones obtenidas de la API
  currentPage: number = 1; // Número de página actual para la paginación de localizaciones
  totalPages: number = 0; // Número total de páginas disponibles para la paginación de localizaciones
  residents: Character[] = []; // Array que almacena a los residentes de una ubicación
  selectedLocation: Location | null = null; // Ubicación seleccionada actualmente para mostrar detalles
  residentsOfLocation: Character[] = []; // Array que almacena a los residentes de la ubicación seleccionada

  constructor(
    private locationsService: LocationsService,
    private characterService: CharactersService
  ) {}

  ngOnInit(): void {
    this.loadAllLocations();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /**
   * Carga todas las ubicaciones desde el servidor utilizando el servicio 'locationsService'.
   * Puede recibir un número de página para cargar un conjunto específico de resultados.
   *
   * @param {number} page El número de página de los resultados que se quiere cargar, por defecto es 1.
   */
  loadAllLocations(page: number = 1): void {
    this.locationsService
      .getAllLocations(page)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (response) => {
          this.locations = response.results;
          this.totalPages = response.info.pages;
        },
        error: () => {
          Swal.fire({
            title: '¡Error!',
            text: 'Error al cargar las ubicaciones. Por favor, inténtelo de nuevo más tarde.',
            icon: 'error',
            iconColor: '#FF4565',
            confirmButtonColor: '#00BCD4',
          });
        },
      });
  }

  /**
   * Abre una ventana modal con los detalles de la ubicación seleccionada.
   * Carga los residentes de la ubicación utilizando el servicio 'characterService'.
   *
   * @param {Location} location El objeto de la ubicación seleccionada.
   */
  openModal(location: Location): void {
    this.selectedLocation = location;

    const residentIds = location.residents.map((url) => +url.split('/').pop()!);

    this.characterService
      .getCharactersByIds(residentIds)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (residents) => {
          this.residentsOfLocation = residents;
        },
        error: () => {
          Swal.fire({
            title: '¡Error!',
            text: 'Error al cargar los residentes. Por favor, inténtelo de nuevo más tarde.',
            icon: 'error',
            iconColor: '#FF4565',
            confirmButtonColor: '#00BCD4',
          });
        },
      });
  }

  /**
   * Método para rastrear las ubicaciones en una lista mediante su ID.
   *
   * Este método se utiliza en las directivas *ngFor para ayudar a Angular a rastrear
   * y gestionar eficientemente los elementos en una lista cuando se producen cambios.
   *
   * @param index El índice del elemento en la lista.
   * @param location La ubicación en la lista correspondiente al índice dado.
   * @returns El ID de la ubicación, que se utiliza como valor de seguimiento único.
   */
  trackByLocationId(index: number, location: Location): number {
    return location.id;
  }

  /**
   * Método para ir a la página siguiente de ubicaciones.
   *
   * Si la página actual es menor que el total de páginas disponibles,
   * incrementa la página actual y carga las ubicaciones de la siguiente página.
   *
   * @returns void
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++; // Incrementa la página actual
      this.loadAllLocations(this.currentPage); // Carga las ubicaciones de la siguiente página
    }
  }

  /**
   * Método para ir a la página anterior de ubicaciones.
   *
   * Si la página actual es mayor que 1, decrementa la página actual
   * y carga las ubicaciones de la página anterior.
   *
   * @returns void
   */
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--; // Decrementa la página actual
      this.loadAllLocations(this.currentPage); // Carga las ubicaciones de la página anterior
    }
  }
}
