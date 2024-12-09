// src/app/interfaces/pokemon-stats.interface.ts
export interface Stat {
    base_stat: number;
    stat: {
      name: string;
      url: string; // Agregado para poder hacer la solicitud para obtener el nombre en español
    };
    name?: string; // Propiedad opcional para el nombre traducido
  }
  