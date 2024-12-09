import { Stat } from "./pokemon-stats.interface";

export interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
  };
  types: Array<{
    type: {
      name: string;
    }
  }>;
  height: number;
  weight: number;
  abilities: Array<{
    ability: {
      name: string;
    };
  }>;
  stats: Stat[]; 
}