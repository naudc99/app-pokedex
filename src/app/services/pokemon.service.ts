import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, mergeMap, forkJoin } from 'rxjs';
import { PokemonListResponse } from '../interfaces/pokemon-list-response.interface';
import { Pokemon } from '../interfaces/pokemon.interface'
import { PokemonSpecies } from '../interfaces/pokemon-species.interface';
import { PokemonAbility } from '../interfaces/pokemon-ability.interface';
import { PokemonType } from '../interfaces/pokemon-type.interface';
import { Stat } from '../interfaces/pokemon-stats.interface';
import { EvolutionChain } from '../interfaces/pokemon-evolution-chain.interface';

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

  private getStatDetail(url: string): Observable<{ names: Array<{ name: string, language: { name: string } }> }> {
    return this.http.get<{ names: Array<{ name: string, language: { name: string } }> }>(url);
  }

  getPokemonStatsWithNames(id: number): Observable<Stat[]> {
    return this.http.get<Pokemon>(`${this.baseUrl}/pokemon/${id}`).pipe(
      mergeMap(pokemon => 
        forkJoin(
          pokemon.stats.map(stat => 
            this.getStatDetail(stat.stat.url).pipe(
              map(statDetail => ({
                base_stat: stat.base_stat,
                stat: stat.stat,
                name: statDetail.names.find(name => name.language.name === 'es')?.name || stat.stat.name
              }))
            )
          )
        )
      )
    );
  }

  getEvolutionChain(id: number): Observable<EvolutionChain> {
    return this.http.get<PokemonSpecies>(`${this.baseUrl}/pokemon-species/${id}`).pipe(
      mergeMap(species => this.http.get<EvolutionChain>(species.evolution_chain.url))
    );
  }

  getPokemonWithDetailsAndEvolution(id: number): Observable<[Pokemon, PokemonSpecies, PokemonAbility, PokemonType[], EvolutionChain]> {
    return this.getPokemonWithDetails(id).pipe(
      mergeMap(([pokemon, species, ability, types]) => 
        forkJoin([
          new Observable<Pokemon>(observer => {
            observer.next(pokemon);
            observer.complete();
          }),
          new Observable<PokemonSpecies>(observer => {
            observer.next(species);
            observer.complete();
          }),
          new Observable<PokemonAbility>(observer => {
            observer.next(ability);
            observer.complete();
          }),
          new Observable<PokemonType[]>(observer => {
            observer.next(types);
            observer.complete();
          }),
          this.getEvolutionChain(id)
        ])
      )
    );
  }
}
