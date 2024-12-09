export interface EvolutionChain {
    chain: {
      species: {
        name: string;
        url: string;
      };
      evolves_to: Array<{
        species: {
          name: string;
          url: string;
        };
        evolves_to: Array<{
          species: {
            name: string;
            url: string;
          };
        }>;
      }>;
    };
  }
  