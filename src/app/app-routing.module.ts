import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CharactersComponent } from './pages/characters-list/characters-list.component';
import { EpisodesComponent } from './pages/episodes-list/episodes-list.component';
import { LocationsComponent } from './pages/locations-list/locations-list.component';

const routes: Routes = [
  { path: '', redirectTo: '/', pathMatch: 'full' }, // Redirige a /characters si la ruta es vacía
  { path: 'characters', component: CharactersComponent }, // Ruta para el listado de personajes
  { path: 'episodes', component: EpisodesComponent }, // Ruta para el listado de episodios
  { path: 'locations', component: LocationsComponent }, // Ruta para el listado de episodios
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
