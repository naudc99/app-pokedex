import { Routes } from '@angular/router';
import { DetailPokemonComponent } from './components/detail-pokemon/detail-pokemon.component';
import { PokedexComponent } from './components/pokedex/pokedex.component';

export const routes: Routes = [
    { path: '', redirectTo: 'index', pathMatch: 'full' },
    { path: 'index', component: PokedexComponent},
];
