import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, mergeMap, forkJoin } from 'rxjs';
import { PokemonListResponse } from '../interfaces/pokemon-list-response.interface';
import { Pokemon } from '../interfaces/pokemon.interface'
import { PokemonSpecies } from '../interfaces/pokemon-species.interface';
import { PokemonAbility } from '../interfaces/pokemon-ability.interfacxe';
import { PokemonType } from '../interfaces/pokemon-type.interface';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {
  private baseUrl = 'https://pokeapi.co/api/v2';

  constructor(private http: HttpClient) {}

  getPokemonList(offset: number, limit: number): Observable<any[]> {
    return this.http.get<PokemonListResponse>(`${this.baseUrl}/pokemon?offset=${offset}&limit=${limit}`).pipe(
      map(response => response.results),
      mergeMap(pokemons => forkJoin(pokemons.map(pokemon => this.getPokemonDetails(pokemon.url))))
    );
  }

  getPokemonDetails(url: string): Observable<Pokemon> {
    return this.http.get<Pokemon>(url);
  }

  searchPokemonByName(name: string): Observable<Pokemon[]> {
    return this.http.get<PokemonListResponse>(`${this.baseUrl}/pokemon?limit=10000`).pipe(
      map(response => response.results.filter(pokemon => pokemon.name.toLowerCase().includes(name.toLowerCase()))),
      mergeMap(filteredPokemons => forkJoin(filteredPokemons.map(pokemon => this.getPokemonDetails(pokemon.url))))
    );
  }

  getPokemonById(id: number): Observable<Pokemon> {
    return this.http.get<Pokemon>(`${this.baseUrl}/pokemon/${id}`);
  }

  getPokemonWithDetails(id: number): Observable<[Pokemon, PokemonSpecies, PokemonAbility, PokemonType[]]> {
    return this.http.get<Pokemon>(`${this.baseUrl}/pokemon/${id}`).pipe(
      mergeMap(pokemon => 
        forkJoin([
          new Observable<Pokemon>(observer => {
            observer.next(pokemon);
            observer.complete();
          }),
          this.http.get<PokemonSpecies>(`${this.baseUrl}/pokemon-species/${id}`),
          this.http.get<PokemonAbility>(`${this.baseUrl}/ability/${pokemon.abilities[0].ability.name}`),
          forkJoin(pokemon.types.map(type => this.http.get<PokemonType>(`${this.baseUrl}/type/${type.type.name}`)))
        ])
      )
    );
  }
}
