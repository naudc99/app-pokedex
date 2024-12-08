import { Component, Inject, OnInit } from '@angular/core';
import { PokemonService } from '../../services/pokemon.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Pokemon } from '../../interfaces/pokemon.interface';
import { PokemonSpecies } from '../../interfaces/pokemon-species.interface';
import { PokemonAbility } from '../../interfaces/pokemon-ability.interfacxe';
import { PokemonType } from '../../interfaces/pokemon-type.interface';

@Component({
  selector: 'app-detail-pokemon',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './detail-pokemon.component.html',
  styleUrl: './detail-pokemon.component.scss'
})
export class DetailPokemonComponent implements OnInit {
  pokemon: Pokemon | null = null;
  species: PokemonSpecies | null = null;
  ability: PokemonAbility | null = null;
  types: PokemonType[] = [];

  constructor(
    public dialogRef: MatDialogRef<DetailPokemonComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private pokemonService: PokemonService
  ) {}

  ngOnInit() {
    this.pokemonService.getPokemonWithDetails(this.data.id).subscribe(
      ([pokemon, species, ability, types]) => {
        this.pokemon = pokemon;
        this.species = species;
        this.ability = ability;
        this.types = types;
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
      hada: '#FF69B4',
      acero: '#B8B8D0',
      normal: '#A8A878',
      fuego: '#F08030',
      agua: '#6890F0',
      eléctrico: '#F8D030',
      planta: '#78C850',
      hielo: '#98D8D8',
      lucha: '#C03028',
      veneno: '#A040A0',
      tierra: '#E0C068',
      volador: '#A890F0',
      psíquico: '#F85888',
      bicho: '#A8B820',
      roca: '#B8A038',
      fantasma: '#705898',
      dragón: '#7038F8',
      siniestro: '#705848',
      // Add English translations for fallback
      fairy: '#FF69B4',
      steel: '#B8B8D0',
      fire: '#F08030',
      water: '#6890F0',
      electric: '#F8D030',
      grass: '#78C850',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
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
}