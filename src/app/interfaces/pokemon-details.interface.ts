export interface PokemonDetails {
  id: number;
  name: string;
  names: { language: { name: string }, name: string }[];
  flavor_text_entries: { language: { name: string }, flavor_text: string }[];
  sprites: {
    front_default: string;
  };
}
