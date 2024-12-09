// src/app/components/detail-pokemon/detail-pokemon.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { PokemonService } from '../../services/pokemon.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Pokemon } from '../../interfaces/pokemon.interface';
import { PokemonSpecies } from '../../interfaces/pokemon-species.interface';
import { PokemonAbility } from '../../interfaces/pokemon-ability.interface';
import { PokemonType } from '../../interfaces/pokemon-type.interface';
import { Stat } from '../../interfaces/pokemon-stats.interface';
import { EvolutionChain } from '../../interfaces/pokemon-evolution-chain.interface';

@Component({
  selector: 'app-detail-pokemon',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './detail-pokemon.component.html',
  styleUrls: ['./detail-pokemon.component.scss']
})
export class DetailPokemonComponent implements OnInit {
  pokemon: Pokemon | null = null;
  species: PokemonSpecies | null = null;
  ability: PokemonAbility | null = null;
  types: PokemonType[] = [];
  stats: Stat[] = [];
  evolutionChain: EvolutionChain | null = null;
  activeTab: 'description' | 'stats' | 'evolution' = 'description';

  constructor(
    public dialogRef: MatDialogRef<DetailPokemonComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private pokemonService: PokemonService
  ) {}

  ngOnInit() {
    this.pokemonService.getPokemonWithDetailsAndEvolution(this.data.id).subscribe(
      ([pokemon, species, ability, types, evolutionChain]) => {
        this.pokemon = pokemon;
        this.species = species;
        this.ability = ability;
        this.types = types;
        this.evolutionChain = evolutionChain;

        this.pokemonService.getPokemonStatsWithNames(this.data.id).subscribe(stats => {
          this.stats = stats;
        });
      },
      (error) => {
        console.error('Error fetching Pokemon details:', error);
      }
    );
  }

  onClose(): void {
    this.dialogRef.close();
  }

  getTypeColor(type: string): string {
    const typeColors: { [key: string]: string } = {
      hada: '#FF69B4', acero: '#B8B8D0', normal: '#A8A878', fuego: '#F08030',
      agua: '#6890F0', eléctrico: '#F8D030', planta: '#78C850', hielo: '#98D8D8',
      lucha: '#C03028', veneno: '#A040A0', tierra: '#E0C068', volador: '#A890F0',
      psíquico: '#F85888', bicho: '#A8B820', roca: '#B8A038', fantasma: '#705898',
      dragón: '#7038F8', siniestro: '#705848',
      // English fallbacks
      fairy: '#FF69B4', steel: '#B8B8D0', fire: '#F08030', water: '#6890F0',
      electric: '#F8D030', grass: '#78C850', ice: '#98D8D8', fighting: '#C03028',
      poison: '#A040A0', ground: '#E0C068', flying: '#A890F0', psychic: '#F85888',
      bug: '#A8B820', rock: '#B8A038', ghost: '#705898', dragon: '#7038F8',
      dark: '#705848'
    };
    return typeColors[type.toLowerCase()] || '#A8A878';
  }

  getPokemonDescription(): string {
    return this.species?.flavor_text_entries.find(entry => entry.language.name === 'es')?.flavor_text || 
           this.species?.flavor_text_entries.find(entry => entry.language.name === 'en')?.flavor_text || 
           'No hay descripción disponible.';
  }

  getAbilityName(): string {
    return this.ability?.names.find(name => name.language.name === 'es')?.name ||
           this.ability?.names.find(name => name.language.name === 'en')?.name ||
           this.pokemon?.abilities[0]?.ability.name || 'Desconocida';
  }

  getTypeName(type: PokemonType): string {
    return type.names.find(name => name.language.name === 'es')?.name ||
           type.names.find(name => name.language.name === 'en')?.name ||
           'Desconocido';
  }

  getStatName(statName: string): string {
    const statNames: { [key: string]: string } = {
      'hp': 'PS', 'attack': 'Ataque', 'defense': 'Defensa',
      'special-attack': 'At. Esp.', 'special-defense': 'Def. Esp.',
      'speed': 'Velocidad'
    };
    return statNames[statName] || statName;
  }

  getStatWidth(value: number): number {
    return (value / 200) * 100; // 200 as max base stat value
  }

  getStatColor(value: number): string {
    if (value <= 59) return '#ff0000'; // Red
    if (value <= 89) return '#ffff00'; // Yellow
    if (value <= 119) return '#90EE90'; // Light green
    if (value <= 200) return '#008000'; // Strong green
    return '#00CED1'; // Turquoise
  }

  getEvolutionChainDetails(): { id: number, name: string, imageUrl: string }[] {
    if (!this.evolutionChain) return [];

    const details: { id: number, name: string, imageUrl: string }[] = [];
    let currentEvolution: any = this.evolutionChain.chain;

    while (currentEvolution) {
      const id = this.getIdFromUrl(currentEvolution.species.url);
      details.push({
        id: parseInt(id),
        name: currentEvolution.species.name,
        imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
      });
      currentEvolution = currentEvolution.evolves_to && currentEvolution.evolves_to.length > 0 
        ? currentEvolution.evolves_to[0] 
        : null;
    }

    return details;
  }

  private getIdFromUrl(url: string): string {
    const parts = url.split('/');
    return parts[parts.length - 2];
  }
}

