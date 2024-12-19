const API_BASE_URL = "http://127.0.0.1:8000"; // Default base URL

interface Compound {
  id: number;
  name: string;
  smiles_string: string;
}

export const fetchCompounds = async (token: string): Promise<Compound[]> => {
  const response = await fetch(`${API_BASE_URL}/compounds`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    // Token is invalid or expired
    localStorage.removeItem("access_token"); // Clear token from storage
    window.location.href = "/login"; // Redirect to login screen
    throw new Error("Unauthorized. Redirecting to login.");
  }

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

export const saveCompound = async (
  compound: { name: string; smiles_string: string },
  token: string
) => {
  const response = await fetch(`${API_BASE_URL}/compounds`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(compound),
  });

  if (!response.ok) {
    throw new Error("Failed to save compound");
  }

  return response.json();
};

export const fetchUsers = async (token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const shareCompound = async (compoundId: number, userId: number, token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/compounds/${compoundId}/share`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to share compound");
      }
  
      return await response.json(); // Return response if needed
    } catch (error) {
      console.error("Error sharing compound:", error);
      throw error;
    }
  };
  
