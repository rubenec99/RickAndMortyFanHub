import { Component, OnInit, OnDestroy } from '@angular/core';

import { Character } from 'src/app/models/character.model';

import { CharactersService } from 'src/app/services/characters.service';
import { EpisodesService } from 'src/app/services/episodes.service';
import { TranslationService } from 'src/app/services/translation.service';

import { EMPTY, Subject } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-characters-list',
  templateUrl: './characters-list.component.html',
  styleUrls: ['./characters-list.component.css'],
})
export class CharactersComponent implements OnInit, OnDestroy {
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
  allGenders: string[] = ['Male', 'Female', 'Unknow', 'Genderless'];
  allStatuses: string[] = ['Alive', 'Unknow', 'Dead'];
  allSpecies: string[] = [
    'Human',
    'Alien',
    'Humanoid',
    'Unknow',
    'Poopybutthole',
    'Mythological Creature',
    'Animal',
    'Robot',
    'Cronenberg',
    'Disease',
  ];
  selectedGender: string = ''; // Almacena el género seleccionado
  selectedStatus: string = ''; // Almacena el estatus seleccionado
  selectedSpecies: string = ''; // Almacena la especie seleccionada

  constructor(
    private charactersService: CharactersService, // Inyecta el servicio de personajes
    private episodesService: EpisodesService, // Inyecta el servicio de episodios
    public modalService: NgbModal, // Inyecta el servicio de modales de Bootstrap
    public translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.loadCharacters(); // Carga los personajes al inicializar el componente
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /**
   * Carga los personajes de la API de Rick y Morty utilizando los parámetros de filtrado actuales.
   * Se suscribe a los cambios del servicio de personajes, solicitando la información basada en la página actual,
   * y los filtros de género, estado y especie seleccionados. Si la API retorna resultados, actualiza
   * la lista de personajes y la cantidad de páginas total. Si no hay resultados o ocurre un error, muestra
   * una notificación al usuario con la información correspondiente.
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
      .subscribe({
        next: (response) => {
          if ('results' in response) {
            this.characters = response.results;
            this.totalPages = response.info.pages;
          } else {
            Swal.fire({
              title: '¡Error!',
              text: 'Error al cargar los personajes. Por favor, inténtelo de nuevo más tarde.',
              icon: 'error',
              iconColor: '#FF4565',
              confirmButtonColor: '#00BCD4',
            });
          }
        },
        error: () => {
          Swal.fire({
            title: '¡Atención!',
            text: 'No hay personajes con los filtros seleccionados.',
            icon: 'info',
            iconColor: '#FFD83D',
            confirmButtonColor: '#00BCD4',
          });
        },
      });
  }

  /**
   * Abre el modal de detalles de un personaje.
   *
   * @param character El personaje para el cual se abrirá el modal de detalles.
   * @param content El contenido del modal.
   */
  openModal(character: Character): void {
    this.selectedCharacter = character;

    const episodeIds = character.episode
      .map((url) => parseInt(url.split('/').pop() || '0'))
      .filter((id) => !isNaN(id));

    this.episodesService
      .getMultipleEpisodes(episodeIds)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (episodes) => {
          if (Array.isArray(episodes)) {
            switch (episodes.length) {
              case 0:
                // No episodes available
                this.episodes = ['No aparece en ningún episodio'];
                break;
              case 1:
                // Single episode returned
                this.episodes = [episodes[0].name];
                break;
              default:
                // Multiple episodes returned
                this.episodes = episodes.map((ep) => ep.name);
                break;
            }
          }
        },
        error: () => {
          Swal.fire({
            title: '¡Error!',
            text: 'Error al cargar los detalles del episodio. Por favor, inténtelo de nuevo más tarde.',
            icon: 'error',
            iconColor: '#FF4565',
            confirmButtonColor: '#00BCD4',
          });
          this.episodes = ['No se pudo cargar la información del episodio'];
        },
      });
  }

  /**
   * Realiza la búsqueda de personajes por nombre basada en el término introducido.
   * Si no hay término de búsqueda o este es solo espacios en blanco, se recargan todos los personajes.
   * Si hay un término de búsqueda, se realiza una petición para buscar los personajes por ese nombre.
   * En caso de un error durante la búsqueda, se muestra una notificación de error al usuario
   * y se procede a cargar todos los personajes nuevamente.
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
      .pipe(
        takeUntil(this.unsubscribe$),
        catchError(() => {
          Swal.fire({
            title: '¡Error!',
            text: 'No hay personajes con el nombre introducido.',
            icon: 'error',
            iconColor: '#FF4565',
            confirmButtonColor: '#00BCD4',
          });
          this.loadCharacters();
          return EMPTY;
        })
      )
      .subscribe({
        next: (response) => {
          this.characters = response.results;
          this.totalPages = response.info.pages;
        },
        error: () => {
          Swal.fire({
            title: '¡Error!',
            text: 'No hay personajes con el nombre introducido.',
            icon: 'error',
            iconColor: '#FF4565',
            confirmButtonColor: '#00BCD4',
          });
          this.loadCharacters();
        },
      });
  }

  /**
   * Maneja el evento de presionar una tecla en el cuadro de búsqueda.
   *
   * @param event El evento de teclado que se ha desencadenado.
   */
  onSearchKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.searchCharacters();
    }
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
   * Método para ir a la página siguiente de personajes.
   *
   * Si la página actual es menor que el total de páginas disponibles,
   * incrementa la página actual y recarga los personajes de la siguiente página.
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
   */
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--; // Decrementa la página actual
      this.loadCharacters(); // Recarga los personajes de la página anterior
    }
  }
}
