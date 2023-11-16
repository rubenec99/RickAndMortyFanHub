import { Component, OnDestroy, OnInit } from '@angular/core';

import { Location } from 'src/app/models/location.model';
import { Character } from 'src/app/models/character.model';

import { LocationsService } from 'src/app/services/locations.service';
import { CharactersService } from 'src/app/services/characters.service';
import { TranslationService } from 'src/app/services/translation.service';

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

  locationTypes: string[] = [
    'Planet',
    'Cluster',
    'Space station',
    'Microverse',
    'TV',
    'Resort',
    'Fantasy town',
    'Dream',
  ];
  dimensions: string[] = [
    'Dimension C-137',
    'unknown',
    'Post-Apocalyptic Dimension',
    'Replacement Dimension',
    'Cronenberg Dimension',
    'Fantasy Dimension',
    'Dimension 5-126',
  ];

  selectedType: string = '';
  selectedDimension: string = '';
  searchTerm: string = '';

  constructor(
    private locationsService: LocationsService,
    private characterService: CharactersService,
    public translationService: TranslationService
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
  loadAllLocations(): void {
    this.locationsService
      .getAllLocations(
        this.currentPage,
        this.selectedType,
        this.selectedDimension
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (response) => {
          this.locations = response.results;
          this.totalPages = response.info.pages;
        },
        error: () => {
          Swal.fire({
            title: '¡Atención!',
            text: 'No hay ubicaciones con los filtros establecidos.',
            icon: 'info',
            iconColor: '#FFD83D',
            confirmButtonColor: '#00BCD4',
          });
        },
      });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadAllLocations();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadAllLocations();
  }

  /**
   * Abre una ventana modal con los detalles de la ubicación seleccionada.
   * Carga los residentes de la ubicación utilizando el servicio 'characterService'.
   *
   * @param {Location} location El objeto de la ubicación seleccionada.
   */
  openModal(location: Location): void {
    this.selectedLocation = location;

    // Obtén los IDs como arreglo de números
    const residentIds = location.residents.map((url) => +url.split('/').pop()!);

    // Si solo hay una URL, asegúrate de que aún se envíe como un arreglo
    const idsToSend = residentIds.length === 1 ? [residentIds[0]] : residentIds;

    this.characterService
      .getCharactersByIds(idsToSend)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (residents) => {
          // Asegúrate de que 'residents' es siempre un arreglo
          this.residentsOfLocation = Array.isArray(residents)
            ? residents
            : [residents];
        },
        error: () => {
          // Handle error
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
   * Obtiene la traducción correspondiente a una clave y un tipo dados.
   *
   * @param key La clave de traducción.
   * @param type El tipo de traducción.
   * @returns La traducción correspondiente o 'Desconocido' si no se encuentra.
   */
  getTranslation(key: string | undefined, type: string): string {
    if (key) {
      return this.translationService.translate(key, type);
    }
    return 'Desconocido';
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
      this.loadAllLocations(); // Carga las ubicaciones de la siguiente página
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
      this.loadAllLocations(); // Carga las ubicaciones de la página anterior
    }
  }

  /**
   * Método para ir a la primera página de personajes.
   *
   * Establece la página actual a 1 y recarga los personajes de la primera página.
   */
  firstPage(): void {
    if (this.currentPage !== 1) {
      this.currentPage = 1; // Establece la página actual en 1
      this.loadAllLocations();
    }
  }

  /**
   * Método para ir a la última página de personajes.
   *
   * Establece la página actual al total de páginas disponibles y recarga
   * los personajes de la última página.
   */
  lastPage(): void {
    if (this.currentPage !== this.totalPages) {
      this.currentPage = this.totalPages; // Establece la página actual en la última página
      this.loadAllLocations();
    }
  }
}
