import { Component, OnDestroy, OnInit } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Location } from 'src/app/models/location.model';
import { Character } from 'src/app/models/character.model';

import { LocationsService } from 'src/app/services/locations.service';
import { CharactersService } from 'src/app/services/characters.service';

@Component({
  selector: 'app-location-list',
  templateUrl: './locations-list.component.html',
  styleUrls: ['./locations-list.component.css'],
})
export class LocationsComponent implements OnInit, OnDestroy {
  constructor(
    private locationsService: LocationsService,
    private characterService: CharactersService
  ) {}

  ngOnInit(): void {
    this.loadAllLocations();
  }

  private unsubscribe$ = new Subject<void>(); // Instancia de Subject que emite un valor cuando es necesario desuscribirse de observables.

  locations: Location[] = []; // Arreglo que almacena las localizaciones obtenidas de la API
  currentPage: number = 1; // Número de página actual para la paginación de localizaciones
  totalPages: number = 0; // Número total de páginas disponibles para la paginación de localizaciones
  residents: Character[] = []; // Arreglo que almacena a los residentes de una ubicación
  selectedLocation: Location | null = null; // Ubicación seleccionada actualmente para mostrar detalles
  residentsOfLocation: Character[] = []; // Arreglo que almacena a los residentes de la ubicación seleccionada
  errorMessage: string | null = null;

  /**
   * Método para cargar todas las localizaciones desde la API con paginación opcional.
   *
   * @param page (Opcional) El número de página que se desea recuperar. Por defecto, es la página 1.
   * @returns void
   */
  loadAllLocations(page: number = 1): void {
    this.locationsService
      .getAllLocations(page)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (response) => {
          this.locations = response.results;
          this.totalPages = response.info.pages;
          this.errorMessage = null; // Limpia el mensaje de error en caso de éxito
        },
        (error) => {
          this.errorMessage = error; // Asigna el mensaje de error en caso de fallo
        }
      );
  }

  /**
   * Abre un modal que muestra los detalles de una ubicación y sus residentes.
   *
   * @param location - La ubicación de la que se desean ver los detalles.
   */
  openModal(location: Location): void {
    this.selectedLocation = location;

    const residentIds = location.residents.map((url) => +url.split('/').pop()!);

    this.characterService
      .getCharactersByIds(residentIds)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (residents) => {
          this.residentsOfLocation = residents;
          this.errorMessage = null; // Limpia el mensaje de error en caso de éxito
        },
        (error) => {
          this.errorMessage = error; // Asigna el mensaje de error en caso de fallo
        }
      );
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

  /**
   * Método que se ejecuta cuando el componente está a punto de ser destruido.
   * Se utiliza para emitir un valor a través del `unsubscribe$` Subject, lo que
   * señala a todos los observables (que estén utilizando `takeUntil(this.unsubscribe$)`)
   * que se desuscriban para evitar pérdidas de memoria.
   * Además, completa el `unsubscribe$` Subject para asegurarse de que no emita más valores.
   */
  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
