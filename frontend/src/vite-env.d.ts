/// <reference types="vite/client" />
declare global {
  interface Window {
    RDKit: RDKitModule;
    initRDKitModule: () => Promise<RDKitModule>;
  }
}

export interface JSMol {
  get_svg(): string;
  // Add other methods from RDKit's JSMol as needed
}

export interface RDKitModule {
  get_mol(smiles: string): JSMol;
  SubstructLibrary: {
    new (): SubstructLibrary;
  };
}
