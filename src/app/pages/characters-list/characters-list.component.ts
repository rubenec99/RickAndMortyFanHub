import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Character } from 'src/app/models/character.model';

import { CharactersService } from 'src/app/services/characters.service';
import { EpisodesService } from 'src/app/services/episodes.service';
import { Episode } from 'src/app/models/episode.model';

@Component({
  selector: 'app-characters-list',
  templateUrl: './characters-list.component.html',
  styleUrls: ['./characters-list.component.css'],
})
export class CharactersComponent implements OnInit, OnDestroy {
  constructor(
    private charactersService: CharactersService, // Inyecta el servicio de personajes
    private episodesService: EpisodesService, // Inyecta el servicio de episodios
    public modalService: NgbModal // Inyecta el servicio de modales de Bootstrap
  ) {}

  ngOnInit(): void {
    this.loadCharacters(); // Carga los personajes al inicializar el componente
  }

  private unsubscribe$ = new Subject<void>(); // Instancia de Subject que emite un valor cuando es necesario desuscribirse de observables.

  characters: Character[] = []; // Almacena los personajes obtenidos de la API
  episodes: string[] = []; // Almacena los nombres de los episodios de un personaje
  currentPage: number = 1; // Página actual de personajes
  totalPages: number = 0; // Total de páginas disponibles
  searchTerm: string = ''; // Término de búsqueda para filtrar todos los personajes
  selectedCharacter: Character | null = null; // Almacena el personaje seleccionado

  /**
   * Arreglos utilizados para almacenar los géneros, estados (status) y especies únicos disponibles en la lista de personajes.
   * Estas propiedades se utilizan para mostrar opciones de filtro y realizar búsquedas avanzadas.
   */
  allGenders: string[] = ['Male', 'Female', 'unknow', 'Gernderless'];
  allStatuses: string[] = ['Alive', 'unknow', 'dead'];
  allSpecies: string[] = [
    'Human',
    'Alien',
    'Humanoid',
    'unknow',
    'Poopybutthole',
    'Mythological Creature',
    'Animal',
    'Robot',
    'Cronenberg',
    'Disease',
  ];
  selectedGender: string = ''; // Almacena el género seleccionado
  selectedStatus: string = ''; // Alamacena el estatus seleccionado
  selectedSpecies: string = ''; // Almacena la especie seleccionada

  /**
   * Método para cargar los personajes de la API.
   *
   * Obtiene los personajes de la página actual, aplicando los filtros seleccionados
   * por género, estado y especie si se han especificado.
   *
   * @returns void
   */
  loadCharacters(): void {
    this.charactersService
      .getAllCharacters(
        this.currentPage,
        this.selectedGender,
        this.selectedStatus,
        this.selectedSpecies
      )
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response) => {
        // Actualiza la lista de personajes con la respuesta de la API
        this.characters = response.results;

        // Actualiza el número total de páginas disponibles
        this.totalPages = response.info.pages;
      });
  }

  /**
   * Abre un modal para mostrar detalles del personaje seleccionado y los episodios en los que aparece.
   *
   * @param character - El personaje seleccionado que se desea mostrar en el modal.
   * @param content - El contenido del modal que se va a abrir.
   */
  openModal(character: Character, content: any): void {
    // Muestra en consola el personaje que será presentado en el modal.
    console.log('Personaje recibido en el modal:', character);

    // Asigna el personaje seleccionado a la variable "selectedCharacter" del componente.
    this.selectedCharacter = character;

    // Extrae los IDs de episodio de las URLs de episodios del personaje.
    // Se asegura de que cada ID sea un número válido, eliminando cualquier valor que no sea un número.
    const episodeIds = character.episode
      .map((url) => parseInt(url.split('/').pop() || '0'))
      .filter((id) => !isNaN(id));
    console.log(character.episode);

    // Utiliza el servicio "episodesService" para obtener detalles de los episodios basándose en los IDs extraídos.
    this.episodesService
      .getMultipleEpisodes(episodeIds)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((episodes) => {
        console.log(episodes);
        if (Array.isArray(episodes)) {
          // Si la respuesta es un array (como se espera), actualiza la lista de episodios con los nombres de los episodios obtenidos.
          this.episodes = episodes.map((ep) => ep.name);
        } else {
          // Si la respuesta no tiene el formato esperado, muestra un error en consola.
          console.error('Unexpected response format:', episodes);
        }
      });

    // Utiliza el servicio "modalService" para abrir el modal, pasando el contenido que debe ser mostrado en el modal.
    // Además, centra el modal en la pantalla.
    this.modalService.open(content, { centered: true });
  }

  /**
   * Método para realizar una búsqueda de personajes por nombre.
   *
   * @returns void
   */
  searchCharacters(): void {
    if (!this.searchTerm.trim()) {
      // Si el término de búsqueda está vacío, recargamos todos los personajes
      this.loadCharacters();
      return;
    }

    // Realiza una búsqueda de personajes por nombre utilizando el término de búsqueda
    this.charactersService
      .searchCharactersByName(this.searchTerm)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((response) => {
        // Actualiza la lista de personajes con los resultados de la búsqueda
        this.characters = response.results;
        // Actualiza el total de páginas disponibles
        this.totalPages = response.info.pages;
      });
  }

  /**
   * Método para manejar los cambios de filtro
   */
  onFilterChange(): void {
    this.currentPage = 1;
    this.loadCharacters();
  }

  /**
   * Método para restablecer todos los filtros y valores de búsqueda a sus valores predeterminados.
   * Esto incluye restablecer el término de búsqueda, género, estado (status) y especie (species).
   * También se restablece la página a la primera página y se recargan los personajes.
   */
  resetFilters(): void {
    this.searchTerm = ''; // Restablece el término de búsqueda
    this.selectedGender = ''; // Restablece el género
    this.selectedStatus = ''; // Restablece el estado (status)
    this.selectedSpecies = ''; // Restablece la especie (species)
    this.currentPage = 1; // Resetea la página al valor predeterminado (primera página)
    this.loadCharacters(); // Vuelve a cargar la lista de personajes con los valores de filtro restablecidos
  }

  /**
   * Método para ir a la página siguiente de personajes.
   *
   * Si la página actual es menor que el total de páginas disponibles,
   * incrementa la página actual y recarga los personajes de la siguiente página.
   *
   * @returns void
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++; // Incrementa la página actual
      this.loadCharacters(); // Recarga los personajes de la siguiente página
    }
  }

  /**
   * Método para ir a la página anterior de personajes.
   *
   * Si la página actual es mayor que 1, decrementa la página actual
   * y recarga los personajes de la página anterior.
   *
   * @returns void
   */
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--; // Decrementa la página actual
      this.loadCharacters(); // Recarga los personajes de la página anterior
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
