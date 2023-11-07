import { Component, OnInit, OnDestroy } from '@angular/core';

import { Subject, throwError } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';

import { Episode } from 'src/app/models/episode.model';
import { Character } from 'src/app/models/character.model';

import { EpisodesService } from 'src/app/services/episodes.service';
import { CharactersService } from 'src/app/services/characters.service';
import { CommentService } from 'src/app/services/comments.service';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/backend/models/user.model';

@Component({
  selector: 'app-episodes-list',
  templateUrl: './episodes-list.component.html',
  styleUrls: ['./episodes-list.component.css'],
})
export class EpisodesComponent implements OnInit, OnDestroy {
  commentText!: string;
  constructor(
    private episodesService: EpisodesService,
    private characterService: CharactersService,
    private commentService: CommentService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadAllEpisodes();
  }

  private unsubscribe$ = new Subject<void>(); // Instancia de Subject que emite un valor cuando es necesario desuscribirse de observables.

  episodes: Episode[] = []; // Lista de episodios que se mostrarán en la vista actual
  currentPage: number = 1; // Página actual en la que se encuentra el usuario
  totalPages: number = 0; // Número total de páginas disponibles con base en el número de episodios
  seasonFilter: string = ''; // Filtro seleccionado por el usuario para ver una temporada específica
  allEpisodes: Episode[] = []; // Episodios recuperados de la API, se utilizan para filtrar
  selectedEpisode: Episode | null = null; // Episodio seleccionado para mostrar en la modal
  charactersOfEpisode: Character[] = []; // Personajes del episodio seleccionado
  uniqueSeasons: string[] = []; // Array que almacena las temporadas únicas extraídas de la lista de episodios
  errorMessage: string | null = null;
  comments: any[] = [];
  episodeId!: number;

  /**
   * Método para cargar todos los episodios de la API con paginación opcional.
   *
   * @param page (Opcional) El número de página que se desea recuperar. Por defecto, es la página 1.
   * @returns void
   */
  loadAllEpisodes(page: number = 1): void {
    this.episodesService
      .getAllEpisodes(page)
      .pipe(
        takeUntil(this.unsubscribe$),
        catchError((error) => {
          this.errorMessage =
            'Error al cargar los episodios. Intente nuevamente.';
          return throwError(() => error);
        })
      )
      .subscribe((response) => {
        this.allEpisodes = [...this.allEpisodes, ...response.results];
        this.totalPages = response.info.pages;

        if (response.info.next) {
          const nextPage = page + 1;
          this.loadAllEpisodes(nextPage);
        } else {
          this.episodes = [...this.allEpisodes];
          this.extractUniqueSeasons();
        }
      });
  }

  /**
   * Método para extraer las temporadas únicas de la lista de episodios.
   *
   * Este método analiza cada episodio en la lista y extrae el código de temporada único
   * (por ejemplo, "Sxx" de "SxxExx"). Luego, almacena las temporadas únicas en el arreglo
   * "uniqueSeasons" en orden ascendente.
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
   * Método para filtrar los episodios por temporada.
   *
   * Si se proporciona un filtro de temporada, se muestran solo los episodios que comienzan con ese número de temporada.
   * Si no se proporciona ningún filtro, se muestran todos los episodios disponibles.
   *
   * @returns void
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
   * Abre la ventana modal y carga los detalles del personaje para el episodio seleccionado.
   *
   * @param episode - El episodio seleccionado.
   */
  openModal(episode: Episode): void {
    this.selectedEpisode = episode;
    this.episodeId = episode.id;

    const characterIds = episode.characters.map(
      (url) => +url.split('/').pop()!
    );

    this.characterService
      .getCharactersByIds(characterIds)
      .pipe(
        takeUntil(this.unsubscribe$),
        catchError((error) => {
          this.errorMessage =
            'Error al cargar los personajes. Intente nuevamente.';
          return throwError(() => error);
        })
      )
      .subscribe((characters) => {
        this.charactersOfEpisode = characters;
        // Abre la ventana modal aquí (Bootstrap se encargará de esto en el HTML)
      });

    // Ahora carga los comentarios para el episodio seleccionado.
    if (this.episodeId) {
      this.loadComments();
    }
  }

  /**
   * Método para rastrear los episodios en una lista mediante su ID.
   *
   * Este método se utiliza en las directivas *ngFor para ayudar a Angular a rastrear
   * y gestionar eficientemente los elementos en una lista cuando se producen cambios.
   *
   * @param index El índice del elemento en la lista.
   * @param episode El episodio en la lista correspondiente al índice dado.
   * @returns El ID del episodio, que se utiliza como valor de seguimiento único.
   */
  trackByEpisodeId(index: number, episode: Episode): number {
    return episode.id;
  }

  submitComment(): void {
    if (!this.userService.isLoggedIn()) {
      alert('Debes iniciar sesión para comentar.');
      return;
    }

    const episodeId = this.selectedEpisode?.id;
    if (episodeId) {
      console.log(
        `Attempting to submit comment for episodeId: ${episodeId} with content: "${this.commentText}"`
      ); // Log the attempt
      this.commentService.addComment(episodeId, this.commentText).subscribe({
        next: (response: any) => {
          console.log('Comment submission response:', response); // Log the response
          this.commentText = '';
        },
        error: (error: any) => {
          console.error('Comment submission error:', error); // Log any error
        },
      });
    } else {
      console.error('No episodeId found for comment submission.'); // Log if there's no episodeId
    }
  }

  loadComments(): void {
    if (!this.episodeId) {
      console.error('Episode ID is undefined, cannot load comments.');
      return;
    }
    this.commentService.getCommentsByEpisode(this.episodeId).subscribe({
      next: (response) => {
        this.comments = response.comments;
      },
      error: (err) => {
        console.error('Error fetching comments:', err);
      },
    });
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
