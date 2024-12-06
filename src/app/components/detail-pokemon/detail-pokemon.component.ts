import { Component, Inject, OnInit } from '@angular/core';
import { PokemonService } from '../../services/pokemon.service';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-detail-pokemon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail-pokemon.component.html',
  styleUrl: './detail-pokemon.component.scss'
})
export class DetailPokemonComponent{
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
