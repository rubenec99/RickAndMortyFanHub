import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CharactersListComponent } from './components/characters-list/characters-list.component';

const routes: Routes = [
  { path: '', redirectTo: '/characters', pathMatch: 'full' }, // Redirige a /characters si la ruta es vacía
  { path: 'characters', component: CharactersListComponent }, // Ruta para el listado de personajes
  // Aquí puedes añadir más rutas en el futuro
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
