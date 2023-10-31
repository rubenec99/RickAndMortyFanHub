import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { CharactersComponent } from './pages/characters-list/characters-list.component';
import { EpisodesComponent } from './pages/episodes-list/episodes-list.component';
import { LocationsComponent } from './pages/locations-list/locations-list.component';
import { AdminPanelComponent } from './pages/admin-panel/admin-panel.component';
import { AdminGuard } from './guards/admin.guard';
import { EditProfileComponent } from './pages/edit-profile/edit-profile.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'characters', component: CharactersComponent },
  { path: 'episodes', component: EpisodesComponent },
  { path: 'locations', component: LocationsComponent },
  { path: 'profile', component: EditProfileComponent },
  {
    path: 'admin',
    component: AdminPanelComponent,
    canActivate: [AdminGuard],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
