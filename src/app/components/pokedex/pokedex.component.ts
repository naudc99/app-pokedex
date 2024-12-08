// pokedex.component.ts
import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { PokemonService } from '../../services/pokemon.service';
import { SearchService } from '../../services/search.service';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule, MatDialogConfig } from '@angular/material/dialog';
import { DetailPokemonComponent } from '../detail-pokemon/detail-pokemon.component';

@Component({
  selector: 'app-pokedex',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './pokedex.component.html',
  styleUrls: ['./pokedex.component.scss']
})
export class PokedexComponent implements OnInit {
  pokemons: any[] = [];
  filteredPokemons: any[] = [];
  offset = 0;
  limit = 10;
  loading = false;
  selectedPokemon: any = null;
  isSearching = false;

  @ViewChild('pokemonListContainer') pokemonListContainer!: ElementRef;

  constructor(
    private pokemonService: PokemonService,
    private searchService: SearchService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadMorePokemon();
    this.searchService.searchTerm$.subscribe((term) => {
      this.onSearch(term);
    });
  }

  ngAfterViewInit() {
    this.pokemonListContainer.nativeElement.addEventListener('scroll', () => this.onScroll());
  }

  loadMorePokemon() {
    if (this.loading || this.isSearching) return;
    this.loading = true;

    this.pokemonService.getPokemonList(this.offset, this.limit).subscribe(
      (newPokemons) => {
        if (newPokemons.length > 0) {
          this.pokemons = [...this.pokemons, ...newPokemons];
          if (!this.isSearching) {
            this.filteredPokemons = [...this.pokemons];
            if (this.offset === 0 && !this.selectedPokemon) {
              this.selectPokemon(this.filteredPokemons[0]);
            }
          }
          this.offset += this.limit;
        } else {
          console.log('No hay más Pokémon para cargar.');
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error al cargar Pokémon:', error);
        this.loading = false;
      }
    );
  }

  onSearch(term: string) {
    if (term) {
      this.isSearching = true;
      this.pokemonService.searchPokemonByName(term).subscribe(
        (result) => {
          this.filteredPokemons = result;
          if (this.filteredPokemons.length > 0) {
            this.selectPokemon(this.filteredPokemons[0]);
          } else {
            this.selectedPokemon = null;
          }
        },
        (error) => {
          console.error('Error al buscar Pokémon:', error);
        }
      );
    } else {
      this.isSearching = false;
      this.filteredPokemons = [...this.pokemons];
      if (this.filteredPokemons.length > 0) {
        this.selectPokemon(this.filteredPokemons[0]);
      }
    }
  }

  selectPokemon(pokemon: any) {
    this.selectedPokemon = pokemon;
  }

  openDialog(pokemon: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = pokemon;
    dialogConfig.width = '90%';
    dialogConfig.maxWidth = '400px';
    dialogConfig.position = {
      top: '50%',
      left: '50%'
    };
    dialogConfig.panelClass = 'center-dialog';

    this.dialog.open(DetailPokemonComponent, dialogConfig);
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