import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { PokemonService } from '../../services/pokemon.service';
import { SearchService } from '../../services/search.service';
import { CommonModule } from '@angular/common';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@Component({
  selector: 'app-pokedex',
  standalone: true,
  imports: [CommonModule, InfiniteScrollModule],
  templateUrl: './pokedex.component.html',
  styleUrls: ['./pokedex.component.scss']
})
export class PokedexComponent implements AfterViewInit {
  pokemons: any[] = []; // Lista paginada de Pokémon
  filteredPokemons: any[] = []; // Lista filtrada para la búsqueda
  offset = 0;
  limit = 10;
  loading = false;
  selectedPokemon: any = null;
  isSearching = false; // Bandera para determinar si estamos en búsqueda

  @ViewChild('pokemonListContainer') pokemonListContainer!: ElementRef;

  constructor(
    private pokemonService: PokemonService,
    private searchService: SearchService
  ) {}

  ngOnInit() {
    this.loadMorePokemon(); // Cargar más Pokémon inicialmente
    this.searchService.searchTerm$.subscribe((term) => {
      this.onSearch(term);
    });
  }

  ngAfterViewInit() {
    this.pokemonListContainer.nativeElement.addEventListener('scroll', () => this.onScroll());
  }

  loadMorePokemon() {
    if (this.loading || this.isSearching) return; // Evitar solicitudes si estamos buscando
    this.loading = true;

    this.pokemonService.getPokemonList(this.offset, this.limit).subscribe(
      (newPokemons) => {
        if (newPokemons.length > 0) {
          this.pokemons = [...this.pokemons, ...newPokemons];
          if (!this.isSearching) {
            this.filteredPokemons = [...this.pokemons]; // Actualizamos solo si no hay búsqueda
          }
          this.offset += this.limit; // Incrementar el offset
        } else {
          console.log('No hay más Pokémon para cargar.');
        }
        this.loading = false; // Cambiar el estado de carga
      },
      (error) => {
        console.error('Error al cargar Pokémon:', error);
        this.loading = false; // Restablecer estado de carga
      }
    );
  }

  onSearch(term: string) {
    if (term) {
      this.isSearching = true; // Indicamos que estamos en modo búsqueda
      this.pokemonService.searchPokemonByName(term).subscribe(
        (result) => {
          this.filteredPokemons = result; // Mostrar resultados de la búsqueda
        },
        (error) => {
          console.error('Error al buscar Pokémon:', error);
        }
      );
    } else {
      this.isSearching = false; // Terminamos la búsqueda
      this.filteredPokemons = [...this.pokemons]; // Mostramos la lista completa
    }
  }

  selectPokemon(pokemon: any) {
    this.selectedPokemon = pokemon;
  }

  onScroll(): void {
    const container = this.pokemonListContainer.nativeElement;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - 50 && !this.loading) {
      this.loadMorePokemon();
    }
  }
}
