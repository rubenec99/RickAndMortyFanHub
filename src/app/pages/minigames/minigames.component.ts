import { Component } from '@angular/core';

import { Character } from 'src/app/models/character.model';

import { CharactersService } from 'src/app/services/characters.service';

import { TriviaQuestion } from 'src/app/models/trivia-question.model';

@Component({
  selector: 'app-trivia',
  templateUrl: './minigames.component.html',
  styleUrls: ['./minigames.component.css'],
})
export class MinigamesComponent {
  triviaQuestions: TriviaQuestion[] = [
    {
      question: '¿Cuál es el nombre completo de Morty?',
      options: [
        'Mortimer Smith',
        'Morty Sanchez',
        'Morty Smith',
        'Morty Johnson',
      ],
      answer: 2,
    },
    {
      question: '¿Qué le gusta beber constantemente a Rick?',
      options: ['Agua', 'Vino', 'Cerveza', 'Whisky de cristales'],
      answer: 3,
    },
    {
      question:
        '¿Cómo se llama la "nieta" robot que Rick crea para Morty en el episodio "El cuadro de los recuerdos"?',
      options: ['Jessica', 'Lucy', 'Stacy', 'Gwendolyn'],
      answer: 3,
    },
    {
      question:
        '¿Qué animal se enfrenta a Rick y Morty en el episodio "Meeseeks y Destroy"?',
      options: ['Un dragón', 'Un gigante', 'Un unicornio', 'Un grifo'],
      answer: 1,
    },
    {
      question: '¿En qué episodio Morty se convierte en un coche?',
      options: [
        'Intercambio de cuerpos',
        'Pickle Rick',
        'El cuadro de los recuerdos',
        'Ajuste de cuentas por cable 2: Tentación del sofá',
      ],
      answer: 3,
    },
    {
      question: '¿Cómo se llama el amigo del instituto de Morty?',
      options: ['Brad', 'Chad', 'Tad', 'Jerry'],
      answer: 0,
    },
    {
      question: '¿Cuál es el nombre de la esposa de Jerry?',
      options: ['Beth', 'Summer', 'Jessica', 'Diane'],
      answer: 0,
    },
    {
      question: '¿Qué animal representa al personaje "Birdperson"?',
      options: ['Loro', 'Aguila', 'Cuervo', 'Pingüino'],
      answer: 1,
    },
    {
      question: '¿Qué objeto usa Rick para viajar entre dimensiones?',
      options: [
        'Anillo Dimensional',
        'Pistola Portal',
        'Máquina del Tiempo',
        'Teletransportador',
      ],
      answer: 1,
    },
    {
      question: '¿Cuál es el trabajo de Beth en su realidad principal?',
      options: [
        'Profesora',
        'Veterinaria de caballos',
        'Doctora',
        'Científica',
      ],
      answer: 1,
    },
    {
      question:
        '¿Cómo se llama el parque de atracciones dentro de un cuerpo humano?',
      options: [
        'Microverso',
        'Parque Anatómico',
        'Espacio Interno',
        'Microparque',
      ],
      answer: 1,
    },
    {
      question: '¿Qué bebida alcohólica prefiere Rick?',
      options: ['Whisky', 'Ron', 'Vodka', 'Cerveza'],
      answer: 2,
    },
    {
      question:
        '¿Cuál es el nombre del planeta que posee el atardecer más largo de la galaxia?',
      options: ['Purgenol-5', 'Blitz and Chitz', 'Planetina', 'Squanch'],
      answer: 0,
    },
    {
      question: '¿Con quién se casó Birdperson?',
      options: ['Tammy', 'Beth', 'Summer', 'Jessica'],
      answer: 0,
    },
    {
      question:
        '¿Cuál es el nombre del episodio donde Morty se convierte en un auto?',
      options: [
        'La Cita Rickturiana de Morty',
        'Mortynight Run',
        'MortyCar',
        'Los Ricks deben estar locos',
      ],
      answer: 1,
    },
    {
      question: '¿Qué juego juegan Rick y Morty en "Blips & Chitz"?',
      options: [
        'Plumbus Adventure',
        'Flappy Birdperson',
        'Roy: A Life Well Lived',
        'Interdimensional Chess',
      ],
      answer: 2,
    },
    {
      question:
        '¿Qué le regala Morty a su amor platónico Jessica en "The Rickchurian Mortydate"?',
      options: ['Un poema', 'Un robot', 'Una poción de amor', 'Una serenata'],
      answer: 2,
    },
    {
      question: '¿Cómo se llama la exnovia parásito de Rick?',
      options: ['Unity', 'Supernova', 'Planeta Janet', 'Diane'],
      answer: 0,
    },
    {
      question: '¿Qué es "The Vindicators"?',
      options: [
        'Un videojuego',
        'Un programa de televisión',
        'Un cómic',
        'Un equipo de superhéroes',
      ],
      answer: 3,
    },
    {
      question:
        '¿Cuál es el nombre de la mascota mecánica de la familia Smith?',
      options: ['Snuffles', 'Kibbles', 'Snowball', 'Sprocket'],
      answer: 2,
    },
    {
      question: '¿Qué frase famosa dice Rick con frecuencia?',
      options: [
        'Wubba Lubba Dub Dub',
        'And away we go',
        'Oh jeez!',
        'That’s the way the news goes!',
      ],
      answer: 0,
    },
    {
      question: '¿Quién es el creador de "Rick y Morty"?',
      options: [
        'Seth MacFarlane',
        'Matt Groening',
        'Justin Roiland y Dan Harmon',
        'Trey Parker y Matt Stone',
      ],
      answer: 2,
    },
    {
      question: '¿En qué se convierte Rick para evitar la terapia familiar?',
      options: ['Un gato', 'Un perro', 'Un pickle', 'Un ratón'],
      answer: 2,
    },
    {
      question: '¿Cuál es la ocupación de Jerry Smith?',
      options: [
        'Desempleado',
        'Publicista',
        'Maestro de escuela',
        'Gerente de banco',
      ],
      answer: 0,
    },
    {
      question: '¿Cómo se llama la dimensión de origen de Rick y Morty?',
      options: ['C-137', 'X-109', 'B-612', 'E-123'],
      answer: 0,
    },
    {
      question: '¿Quién es el enemigo jurado de Rick?',
      options: ['Birdperson', 'Mr. Meeseeks', 'The President', 'Evil Morty'],
      answer: 3,
    },
    {
      question: '¿Cómo se llama el amigo imaginario de Beth cuando era niña?',
      options: ['Mr. Poopybutthole', 'Tinkles', 'Squanchy', 'Sleepy Gary'],
      answer: 1,
    },
    {
      question: '¿Qué es lo que Morty más desea obtener en "Mortynight Run"?',
      options: [
        'Un día libre de aventuras',
        'Un videojuego',
        'Una cita con Jessica',
        'Su propia habitación',
      ],
      answer: 1,
    },
    {
      question: '¿En qué trabaja Summer Smith en varios episodios?',
      options: [
        'En una tienda de comestibles',
        'En una tienda de ropa',
        'En una cafetería',
        'En la guardería de Jerryboree',
      ],
      answer: 1,
    },
    {
      question:
        '¿Cuál es el nombre del "país de los perros" que Snowball intenta crear?',
      options: ['Dogland', 'Snuffles’ Kingdom', 'Caninopia', 'Dogworld'],
      answer: 2,
    },
    {
      question:
        '¿Qué frase utiliza Summer para describir cuando algo se vuelve muy común?',
      options: ['Lame', 'Basic', 'Jerry', 'Schwifty'],
      answer: 1,
    },
  ];

  answerStatus: boolean[] = [];
  feedbackMessage: string = '';
  displayedQuestions: TriviaQuestion[] = [];
  correctAnswersCount = 0; // Número de respuestas correctas
  showProgressBar: boolean = false;
  allCorrect: boolean = false;

  charactersOptions: Character[] = [];
  correctCharacter: Character | null = null;
  selectedCharacterId: number | null = null;
  isCorrect: boolean | null = null;
  loading: boolean = false;

  constructor(private charactersService: CharactersService) {}

  ngOnInit(): void {
    // Obtener un conjunto de preguntas al azar
    this.getRandomQuestions();
    this.loadRandomCharacters();
  }

  /**
   * Verifica todas las respuestas seleccionadas y muestra una barra de progreso con la cantidad de respuestas correctas.
   */
  checkAllAnswers(): void {
    this.correctAnswersCount = 0;
    this.answerStatus = []; // Reiniciar el estado de las respuestas

    this.displayedQuestions.forEach((question, index) => {
      const selectedOption = (
        document.querySelector(
          `input[name="trivia-${index}"]:checked`
        ) as HTMLInputElement
      )?.value;

      if (selectedOption && +selectedOption === question.answer) {
        this.correctAnswersCount++;
        this.answerStatus.push(true); // Respuesta correcta
      } else {
        this.answerStatus.push(false); // Respuesta incorrecta
      }
    });

    this.generateFeedbackMessage();
    this.showProgressBar = true;
  }

  /**
   * Genera un mensaje de retroalimentación basado en la cantidad de respuestas correctas.
   */
  private generateFeedbackMessage(): void {
    if (this.correctAnswersCount === 0) {
      this.feedbackMessage = `¡No has respondido correctamente ninguna pregunta!`;
    } else {
      this.feedbackMessage = `¡Has respondido correctamente a ${this.correctAnswersCount} de ${this.displayedQuestions.length} preguntas!`;
      this.allCorrect =
        this.correctAnswersCount === this.displayedQuestions.length;

      if (this.allCorrect === true) {
        this.feedbackMessage = '¡Enhorabuena has acertado todas las preguntas!';
      }
    }
  }

  /**
   * Obtiene un conjunto aleatorio de preguntas de la lista completa de preguntas de trivia.
   */
  getRandomQuestions(): void {
    const shuffledQuestions = this.triviaQuestions.sort(
      () => 0.5 - Math.random()
    );
    this.displayedQuestions = shuffledQuestions.slice(0, 5);
  }

  /**
   * @returns El porcentaje de respuestas correctas.
   */
  getProgressPercentage(): number {
    return (this.correctAnswersCount / this.displayedQuestions.length) * 100;
  }

  /**
   * Carga personajes aleatorios para el juego.
   */
  loadRandomCharacters(): void {
    // Resetear el estado del mensaje y el personaje seleccionado.
    this.isCorrect = null;
    this.selectedCharacterId = null;

    this.loading = true;
    this.charactersService.getRandomCharacters(3).subscribe((characters) => {
      this.charactersOptions = characters;
      this.correctCharacter =
        characters[Math.floor(Math.random() * characters.length)];
      this.loading = false;
    });
  }

  /**
   * Verifica si la respuesta seleccionada es correcta.
   * @param character - El personaje seleccionado por el usuario.
   */
  checkAnswer(character: Character): void {
    this.isCorrect = character.id === this.correctCharacter!.id;

    if (this.isCorrect) {
      // Esperar 3 segundos antes de cargar nuevos personajes.
      setTimeout(() => {
        this.loadRandomCharacters();
      }, 1000);
    }
  }

  /**
   * Establece el ID del personaje seleccionado por el usuario.
   * @param id - El ID del personaje seleccionado.
   */
  selectCharacter(id: number): void {
    this.selectedCharacterId = id;
  }

  /**
   * Método para resetear el juego de las preguntas
   */
  resetGame(): void {
    // Restablece el estado del juego
    this.correctAnswersCount = 0;
    this.showProgressBar = false;
    this.allCorrect = false;
    this.answerStatus = [];
    this.feedbackMessage = '';

    // Carga nuevas preguntas y personajes
    this.getRandomQuestions();
  }
}
