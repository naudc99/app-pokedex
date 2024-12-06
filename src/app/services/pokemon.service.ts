import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, mergeMap, forkJoin } from 'rxjs';
import { PokemonListResponse } from '../interfaces/pokemon-list-response.interface';
import { Pokemon } from '../interfaces/pokemon.interface';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private baseUrl = 'https://pokeapi.co/api/v2';

  constructor(private http: HttpClient) {}

  // Método para obtener una lista paginada de Pokémon
  getPokemonList(offset: number, limit: number): Observable<any[]> {
    return this.http.get<PokemonListResponse>(`${this.baseUrl}/pokemon?offset=${offset}&limit=${limit}`).pipe(
      map(response => response.results),
      mergeMap(pokemons => forkJoin(pokemons.map(pokemon => this.getPokemonDetails(pokemon.url))))
    );
  }

  // Método para obtener detalles de un Pokémon específico por su URL
  getPokemonDetails(url: string): Observable<Pokemon> {
    return this.http.get<Pokemon>(url);
  }

  // Método para buscar Pokémon por nombre
  searchPokemonByName(name: string): Observable<Pokemon[]> {
    return this.http.get<PokemonListResponse>(`${this.baseUrl}/pokemon?limit=10000`).pipe( // Ajusta el límite si es necesario
      map(response => response.results.filter(pokemon => pokemon.name.toLowerCase().includes(name.toLowerCase()))),
      mergeMap(filteredPokemons => forkJoin(filteredPokemons.map(pokemon => this.getPokemonDetails(pokemon.url))))
    );
  }
}
