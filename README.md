# RickAndMortyFanHub

Aplicación web desarrollada con Angular, Node.js, Express.js y MySQL que ofrece una plataforma para que los usuarios puedan interactuar con la API de Rick and Morty. 
Los usuarios pueden explorar información sobre personajes, episodios y más de la serie de televisión "Rick and Morty". También pueden realizar valoraciones, 
dejar comentarios y marcar episodios como vistos.

Este proyecto se ha creado con [Angular CLI](https://github.com/angular/angular-cli) version 15.2.0.

## Funcionalidades principales 🌱
* Explorar personajes, episodios y locaciones.
* Valorar y comentar episodios.
* Marcar episodios como vistos.

## Comenzando 🚀

Estas instrucciones te proporcionarán una copia del proyecto en funcionamiento en tu máquina local para propósitos de desarrollo y pruebas.

  ### Pre-requisitos 📋

  Qué cosas necesitas para instalar el software y cómo instalarlas:
    * Node.js
    * Angular CLI

  ### Instalación 🔧
  
    Pasos para obtener un entorno de desarrollo en marcha:
      1. Clona el repositorio:
        git clone https://github.com/rubenec99/RickAndMortyFanHub.git
      2. Accede a la carpeta del proyecto:
        cd RickAndMortyFanHub
      3. Instala las dependencias:
        npm install
      4. Inicia el backend:
        node server.js
      5. En una nueva terminal, arrancar el servidor de desarrollo de Angular:
        ng serve

## Configuración de la base de datos 🖇️
  Para configurar la base de datos:
    1. Asegúrate de tener MySQL instalado.
    2. Crea una base de datos llamada `rickandmortyfanhubdb`.
    3. Importa el archivo `db_init.sql` para inicializar las tablas.
    4. Actualiza las credenciales de acceso en el archivo `config/db.config.js`.
    

## Construido con 🛠️
  * [Angular CLI](https://github.com/angular/angular-cli): Framework para crear aplicaciones SPA.
  * [Node.js](https://github.com/nodejs): Entorno de ejecución para JavaScript.
  * [Express.js](https://expressjs.com/): Framework para Node.js, facilita el desarrollo de aplicaciones web y API.
  * [Rick and Morty API](https://rickandmortyapi.com/): API para obtener datos de la serie.

## Versionado 📌
* Se utiliza git para el control de versiones del proyecto.

## Autor ✒️
* Rubén Escudero - rubenec99
