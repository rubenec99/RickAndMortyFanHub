import { Component, OnInit, OnDestroy } from '@angular/core';

import { Episode } from 'src/app/models/episode.model';
import { Character } from 'src/app/models/character.model';

import { EpisodesService } from 'src/app/services/episodes.service';
import { CharactersService } from 'src/app/services/characters.service';
import { CommentService } from 'src/app/services/comments.service';
import { UserService } from 'src/app/services/user.service';
import { RatingService } from 'src/app/services/rating.service';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-episodes-list',
  templateUrl: './episodes-list.component.html',
  styleUrls: ['./episodes-list.component.css'],
})
export class EpisodesComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  episodes: Episode[] = [];
  allEpisodes: Episode[] = [];
  charactersOfEpisode: Character[] = [];
  uniqueSeasons: string[] = [];
  comments: any[] = [];

  commentText: string = ' ';
  episodeId!: number;
  currentUserId: number | null = null;
  currentRating: number = 0;
  selectedRating: number = 0;
  selectedEpisode: Episode | null = null;

  currentPage: number = 1;
  totalPages: number = 0;
  seasonFilter: string = '';

  userRating: number | null = null;
  averageRating: number = 0;

  constructor(
    private episodesService: EpisodesService,
    private characterService: CharactersService,
    private commentService: CommentService,
    private userService: UserService,
    private ratingService: RatingService
  ) {}

  ngOnInit() {
    this.loadAllEpisodes();
    this.setCurrentUserId();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  /**
   * Carga todos los episodios desde un servicio, de forma paginada.
   * Este método se llama recursivamente hasta que se han cargado todos los episodios disponibles.
   *
   * @param page La página de episodios a cargar, inicia en 1 por defecto.
   */
  loadAllEpisodes(page: number = 1): void {
    this.episodesService
      .getAllEpisodes(page)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (response) => {
          this.allEpisodes = [...this.allEpisodes, ...response.results];
          this.totalPages = response.info.pages;

          if (response.info.next) {
            const nextPage = page + 1;
            this.loadAllEpisodes(nextPage);
          } else {
            this.episodes = [...this.allEpisodes];
            this.extractUniqueSeasons();
          }
        },
        error: () => {
          Swal.fire({
            title: '¡Error!',
            text: 'Error al cargar los episodios. Por favor, inténtelo de nuevo más tarde.',
            icon: 'error',
            iconColor: '#FF4565',
            confirmButtonColor: '#00BCD4',
          });
        },
      });
  }

  /**
   * Extrae y almacena los códigos de temporada únicos de la lista de todos los episodios.
   * Este método es útil para crear un filtro de temporada en la interfaz de usuario.
   */
  extractUniqueSeasons() {
    // Crea un conjunto (Set) para almacenar temporadas únicas
    const seasonsSet = new Set<string>();

    // Itera a través de todos los episodios en la lista
    this.allEpisodes.forEach((episode) => {
      // Extrae el código de temporada (por ejemplo, "Sxx" de "SxxExx")
      const seasonCode = episode.episode.slice(0, 3);

      // Agrega la temporada al conjunto (Set)
      seasonsSet.add(seasonCode);
    });

    // Convierte el conjunto (Set) en un arreglo y lo ordena en orden ascendente
    this.uniqueSeasons = Array.from(seasonsSet).sort();
  }

  /**
   * Filtra la lista completa de episodios basándose en la temporada seleccionada.
   * Si se selecciona una temporada, la lista se reduce a los episodios de esa temporada.
   * Si no se selecciona ninguna temporada, se muestra la lista completa de episodios.
   */
  filterBySeason(): void {
    if (this.seasonFilter) {
      // Filtra los episodios que comienzan con el número de temporada especificado
      this.episodes = this.allEpisodes.filter((episode) =>
        episode.episode.startsWith(this.seasonFilter)
      );
    } else {
      // Si no se proporciona un filtro, muestra todos los episodios
      this.episodes = [...this.allEpisodes];
    }
  }

  /**
   * Abre la modal de personajes y carga la información relacionada con el episodio.
   *
   * @param episode El episodio para el cual se abrirá la modal de personajes.
   */
  openCharactersModal(episode: Episode): void {
    // Establece el episodio seleccionado y realiza las inicializaciones necesarias
    this.selectedEpisode = episode;
    this.episodeId = episode.id;
    this.initializeRating();

    // Obtiene los IDs de los personajes a partir de las URL de los personajes en el episodio
    const characterIds = episode.characters.map(
      (url) => +url.split('/').pop()!
    );

    // Llama al servicio para obtener los personajes por sus IDs
    this.characterService
      .getCharactersByIds(characterIds)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (characters) => {
          // Almacena los personajes del episodio en la propiedad correspondiente del componente
          this.charactersOfEpisode = characters;
        },
        error: () => {
          Swal.fire({
            title: '¡Error!',
            text: 'Error al cargar los personajes. Por favor, inténtelo de nuevo más tarde.',
            icon: 'error',
            iconColor: '#FF4565',
            confirmButtonColor: '#00BCD4',
          });
        },
      });
  }

  /**
   * Abre la modal de comentarios y carga los comentarios relacionados con el episodio.
   *
   * @param episode El episodio para el cual se abrirá la modal de comentarios.
   */
  openCommentsModal(episode: Episode): void {
    // Establece el episodio seleccionado y realiza las inicializaciones necesarias
    this.selectedEpisode = episode;
    this.episodeId = episode.id;
    this.initializeRating();

    // Carga los comentarios para el episodio seleccionado
    if (this.episodeId) {
      this.loadComments();
    }
  }

  /**
   * Función de seguimiento para su uso en `*ngFor` que permite a Angular identificar de manera única
   * cada ítem en una lista de episodios para optimizar el proceso de detección de cambios.
   * Esto evita la re-renderización innecesaria de elementos DOM que no han cambiado.
   *
   * @param {number} index El índice del episodio en la lista iterable.
   * @param {Episode} episode El episodio actual en la iteración.
   * @returns {number} El identificador único del episodio, que es utilizado por Angular para rastrear los elementos.
   */
  trackByEpisodeId(index: number, episode: Episode): number {
    return episode.id;
  }

  /**
   * Envía un comentario para el episodio seleccionado.
   * Antes de enviar el comentario, se realizan verificaciones para asegurarse de que el usuario esté autenticado y que el comentario no esté vacío.
   */
  submitComment(): void {
    // Verifica si el usuario está autenticado, mostrando una alerta y deteniendo el proceso si no lo está.
    if (!this.userService.isLoggedIn()) {
      Swal.fire({
        title: 'Autenticación requerida',
        text: 'Debes iniciar sesión para comentar.',
        icon: 'warning',
        iconColor: '#FFD83D',
        confirmButtonColor: '#00BCD4',
      });
      return;
    }

    // Comprueba que el texto del comentario no esté vacío ni solo contenga espacios en blanco.
    if (!this.commentText.trim()) {
      Swal.fire({
        title: 'Comentario vacío',
        text: 'El comentario no puede estar vacío.',
        icon: 'info',
        iconColor: '#FFD83D',
        confirmButtonColor: '#00BCD4',
      });
      return;
    }

    // Obtiene el ID del episodio seleccionado si existe.
    const episodeId = this.selectedEpisode?.id;
    if (episodeId) {
      // Realiza la llamada al servicio para añadir el comentario.
      this.commentService.addComment(episodeId, this.commentText).subscribe({
        next: () => {
          // Limpia el campo de texto del comentario y recarga los comentarios después de un éxito.
          this.commentText = '';
          this.loadComments();
          // Muestra un mensaje de éxito.
          Swal.fire({
            title: 'Éxito',
            text: 'El comentario ha sido publicado.',
            icon: 'success',
            confirmButtonColor: '#00BCD4',
            iconColor: '#A8FF44',
          });
        },
        error: () => {
          // Muestra un mensaje de error si no se puede enviar el comentario.
          Swal.fire({
            title: '¡Error!',
            text: 'Error al enviar el comentario. Por favor, inténtelo de nuevo más tarde.',
            icon: 'error',
            iconColor: '#FF4565',
            confirmButtonColor: '#00BCD4',
          });
        },
      });
    } else {
      // Muestra un mensaje de error si no se encuentra el ID del episodio.
      Swal.fire({
        title: 'Error interno',
        text: 'No se encontró el identificador del episodio para enviar el comentario.',
        icon: 'error',
        iconColor: '#FF4565',
        confirmButtonColor: '#00BCD4',
      });
    }
    // Reinicia cualquier calificación seleccionada previamente.
    this.initializeRating();
  }

  /**
   * Carga los comentarios para el episodio seleccionado.
   * Muestra un mensaje de error si el ID del episodio no está definido o si hay un error en la carga de comentarios.
   */
  loadComments(): void {
    // Verifica si el ID del episodio está definido, si no, muestra un mensaje de error.
    if (!this.episodeId) {
      Swal.fire({
        title: 'Error interno',
        text: 'El ID del episodio no está definido, no se pueden cargar los comentarios.',
        icon: 'error',
        iconColor: '#FF4565',
        confirmButtonColor: '#00BCD4',
      });
      return;
    }

    // Realiza la llamada al servicio para obtener los comentarios del episodio usando el ID.
    this.commentService.getCommentsByEpisode(this.episodeId).subscribe({
      next: (response) => {
        // Asigna la respuesta a la propiedad de comentarios para mostrar en la interfaz de usuario.
        this.comments = response.comments;
      },
      error: () => {
        // Muestra un mensaje de error si ocurre un error al cargar los comentarios.
        Swal.fire({
          title: '¡Error!',
          text: 'Error al cargar los comentarios. Por favor, inténtelo de nuevo más tarde.',
          icon: 'error',
          iconColor: '#FF4565',
          confirmButtonColor: '#00BCD4',
        });
      },
    });
  }

  /**
   * Comprueba si el usuario actual es administrador.
   *
   * @returns {boolean} Verdadero si el usuario es administrador, falso en caso contrario.
   */
  isAdmin(): boolean {
    const userType = localStorage.getItem('userType');
    return userType === 'admin';
  }

  /**
   * Solicita confirmación y elimina un comentario.
   *
   * @param {number} commentId El ID del comentario a eliminar.
   */
  deleteComment(commentId: number): void {
    Swal.fire({
      title: 'Confirmación',
      text: '¿Estás seguro de que deseas eliminar el comentario? Esta acción es irreversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      background: '#FFFFFF',
      confirmButtonColor: '#FF4565',
      cancelButtonColor: '#1F1F2E',
      iconColor: '#FFD83D',
    }).then((result) => {
      // Comprueba si el usuario confirmó la acción.
      if (result.isConfirmed) {
        // Realiza la llamada al servicio para eliminar el comentario.
        this.commentService.deleteComment(commentId).subscribe({
          next: () => {
            // Notifica al usuario que el comentario ha sido eliminado.
            Swal.fire({
              title: 'Eliminado',
              text: 'El comentario ha sido eliminado con éxito.',
              icon: 'info',
              iconColor: '#FFD83D',
              confirmButtonColor: '#00BCD4',
            });
            // Elimina el comentario de la lista en la interfaz de usuario sin necesidad de recargar.
            this.comments = this.comments.filter(
              (comment) => comment.id !== commentId
            );
          },
          error: () => {
            // Notifica al usuario si hubo un error durante la eliminación.
            Swal.fire({
              title: '¡Error!',
              text: 'Error al eliminar el comentario. Por favor, inténtelo de nuevo más tarde.',
              icon: 'error',
              iconColor: '#FF4565',
              confirmButtonColor: '#00BCD4',
            });
          },
        });
      }
    });
  }

  /**
   * Determina si el usuario actual puede eliminar un comentario.
   * Un usuario puede eliminar un comentario si es el autor del mismo o si es un administrador.
   *
   * @param {number} commentUserId El ID del usuario que realizó el comentario.
   * @returns {boolean} Verdadero si el usuario puede eliminar el comentario, falso si no.
   */
  canDeleteComment(commentUserId: number): boolean {
    return this.isUserComment(commentUserId) || this.isAdmin();
  }

  /**
   * Actualiza el ID del usuario actual.
   */
  setCurrentUserId(): void {
    this.currentUserId = this.userService.getCurrentUserId();
  }

  /**
   * Determina si el comentario fue realizado por el usuario actual.
   *
   * @param commentUserId El ID del usuario que hizo el comentario.
   * @returns Verdadero si el comentario fue hecho por el usuario actual, falso de lo contrario.
   */
  isUserComment(commentUserId: number): boolean {
    // Compara el ID del usuario actual con el ID del usuario que hizo el comentario.
    return this.currentUserId === commentUserId;
  }

  /**
   * Envía la calificación dada por un usuario a un episodio.
   * Primero, verifica si el usuario está autenticado.
   * Si no lo está, muestra una alerta solicitando que inicie sesión.
   * Si el usuario está autenticado, continúa con la lógica para enviar la calificación.
   */
  submitRating(): void {
    if (!this.userService.isLoggedIn()) {
      Swal.fire({
        title: 'Autenticación requerida',
        text: 'Debes iniciar sesión para poder calificar un episodio.',
        icon: 'info',
        iconColor: '#FFD83D',
        confirmButtonColor: '#00BCD4',
      });
      return;
    }

    const episodeId = this.selectedEpisode?.id;
    if (episodeId) {
      this.ratingService.addRating(episodeId, this.currentRating).subscribe({
        next: () => {
          Swal.fire({
            title: 'Éxito',
            text: '¡Has calificado el episodio!',
            icon: 'success',
            confirmButtonColor: '#00BCD4',
            iconColor: '#A8FF44',
          });
          this.initializeRating();
        },
        error: () => {
          Swal.fire({
            title: '¡Error!',
            text: 'Error al enviar la calificación. Por favor, inténtelo de nuevo más tarde.',
            icon: 'error',
            iconColor: '#FF4565',
            confirmButtonColor: '#00BCD4',
          });
        },
      });
    } else {
      Swal.fire({
        title: 'Error interno',
        text: 'No se encontró el identificador del episodio para la calificación.',
        icon: 'error',
        iconColor: '#FF4565',
        confirmButtonColor: '#00BCD4',
      });
    }
  }

  /**
   * Inicializa la calificación de un episodio.
   * Si hay un episodio seleccionado, solicita la calificación promedio y la calificación del usuario.
   * Muestra mensajes de error si ocurre algún problema al recuperar las calificaciones.
   * Si el usuario está autenticado y seleccionó un episodio, también recupera su calificación individual.
   */
  initializeRating(): void {
    // Comprueba si hay un episodio seleccionado.
    if (this.selectedEpisode) {
      // Solicita la calificación promedio para el episodio seleccionado.
      this.ratingService
        .getAverageRating(`${this.selectedEpisode.id}`)
        .subscribe({
          next: (response: any) => {
            // Establece la calificación promedio, convirtiendo la respuesta a un número flotante si existe.
            this.averageRating = response.averageRating
              ? parseFloat(response.averageRating)
              : 0;
          },
          error: () => {
            // Muestra un mensaje de error si hay un problema al obtener la calificación promedio.
            Swal.fire({
              icon: 'error',
              title: 'Error interno',
              text: 'Error al obtener la calificación promedio. Por favor, inténtelo de nuevo más tarde.',
              iconColor: '#FF4565',
              confirmButtonColor: '#00BCD4',
            });
            // Establece la calificación promedio en 0 debido al error.
            this.averageRating = 0;
          },
        });

      // Si el usuario está autenticado, solicita su calificación para el episodio.
      if (this.userService.isLoggedIn()) {
        this.ratingService.getRatingByUser(this.selectedEpisode.id).subscribe({
          next: (userRatingResponse: any) => {
            // Establece la calificación del usuario, convirtiéndola a número flotante si existe, o nula si no.
            this.userRating = userRatingResponse.rating
              ? parseFloat(userRatingResponse.rating)
              : null;
            // La calificación actual se establece a la del usuario o a 0 si no ha calificado.
            this.currentRating = this.userRating !== null ? this.userRating : 0;
          },
          error: () => {
            // Muestra un mensaje de error si hay un problema al obtener la calificación del usuario.
            Swal.fire({
              icon: 'error',
              title: 'Error interno',
              text: 'Error al obtener su calificación. Por favor, inténtelo de nuevo más tarde.',
              iconColor: '#FF4565',
              confirmButtonColor: '#00BCD4',
            });
            // Establece la calificación del usuario y la actual en 0 debido al error.
            this.userRating = null;
            this.currentRating = 0;
          },
        });
      }
    } else {
      // Si no hay episodio seleccionado, muestra una advertencia y establece las calificaciones en 0.
      Swal.fire({
        title: 'Advertencia',
        text: 'No se ha seleccionado ningún episodio para obtener calificaciones.',
        icon: 'warning',
        iconColor: '#FFD83D',
        confirmButtonColor: '#00BCD4',
      });
      this.currentRating = 0;
      this.averageRating = 0;
    }
  }
}
