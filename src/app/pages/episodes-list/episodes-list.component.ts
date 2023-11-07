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

  deleteComment(commentId: number): void {
    // Confirmación para el usuario antes de eliminar el comentario
    if (
      !window.confirm('¿Estás seguro de que quieres eliminar este comentario?')
    ) {
      return;
    }

    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        console.log('Comentario eliminado con éxito');
        // Eliminar el comentario de la lista de comentarios en el frontend
        this.comments = this.comments.filter(
          (comment) => comment.id !== commentId
        );
      },
      error: (err) => {
        console.error('Error al eliminar el comentario:', err);
      },
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
