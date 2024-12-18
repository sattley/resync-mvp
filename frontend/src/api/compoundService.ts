interface Compound {
  id: number;
  name: string;
  smiles_string: string;
}

export const fetchCompounds = async (token: string): Promise<Compound[]> => {
  const response = await fetch("http://127.0.0.1:8000/compounds", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch compounds");
  }

  return response.json();
};

export const fetchCompoundName = async (smiles: string): Promise<string> => {
  const url = `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(
    smiles
  )}/property/IUPACName/JSON`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(
        "PubChem API returned a non-OK response. Using placeholder name."
      );
      return "Name Not Found";
    }

    const data = await response.json();
    return data?.PropertyTable?.Properties[0]?.IUPACName || "Name Not Found";
  } catch (error) {
    console.error("Error fetching compound name:", error);
    return "Name Not Found";
  }
};
