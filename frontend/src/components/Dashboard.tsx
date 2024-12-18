import { useEffect, useState } from "react";
import Header from "./Header";
import SearchInput from "./SearchInput";
import CompoundCard from "./CompoundCard";
import { fetchCompounds, fetchCompoundName } from "../api/compoundService";

interface Compound {
  id: number;
  name: string;
  smiles_string: string;
}

const Dashboard = () => {
  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<Compound | null>(null);

  useEffect(() => {
    const loadCompounds = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("User not logged in");
        return;
      }

      try {
        const data = await fetchCompounds(token);
        setCompounds(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };

    loadCompounds();
  }, []);

  // Clear searchResult when searchQuery is empty
  useEffect(() => {
    if (searchQuery === "") {
      setSearchResult(null);
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    // Ensure the search query is not empty
    if (!searchQuery.trim()) {
      alert("Please enter a SMILES string before searching.");
      setSearchResult(null); // Clear any existing results
      return;
    }

    try {
      // Parse SMILES string and generate molecule
      const mol = window.RDKit.get_mol(searchQuery);
      const moleculeSvg = mol.get_svg();

      // Check if the molecule already exists in the user's dashboard
      const existingCompound = compounds.find(
        (compound) => compound.smiles_string === searchQuery
      );

      if (existingCompound) {
        alert("This compound is already in your dashboard.");
        setSearchResult(null); // Clear search result since it's already saved
        return;
      }

      const compoundName = await fetchCompoundName(searchQuery);

      // Update search result with the molecule data
      setSearchResult({
        id: Date.now(), // Temporary ID for the search result
        name: compoundName, // Use fetched compound name
        smiles_string: searchQuery,
      });
    } catch (error) {
      console.error("Error processing SMILES string:", error);
      alert("Invalid SMILES string. Please try again.");
      setSearchResult(null);
    }
  };

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(`http://127.0.0.1:8000/compounds/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setCompounds((prevCompounds) =>
          prevCompounds.filter((compound) => compound.id !== id)
        );
      } else {
        console.error("Failed to delete compound");
      }
    } catch (error) {
      console.error("Error deleting compound:", error);
    }
  };

  const handleShare = (id: number) => {
    alert(`Sharing compound with ID: ${id}`); // Replace with actual sharing logic
  };

  // Logout functionality
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    window.location.reload(); // Refresh the page to show login
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header onLogout={handleLogout} />
      <div className="p-8">
        {error && <p className="text-red-500">{error}</p>}

        <SearchInput
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearch={handleSearch}
        />

        {searchResult && (
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">Search Result:</h3>
            <CompoundCard
              id={searchResult.id}
              name={searchResult.name}
              smiles={searchResult.smiles_string}
              onSave={(id) => {
                setCompounds((prev) => [...prev, searchResult]);
                setSearchResult(null); // Clear search result after saving
                alert("Compound added to your dashboard!");
              }}
            />
          </div>
        )}

        <h2 className="text-2xl font-bold mb-4">Your Compounds</h2>
        <div className="flex flex-wrap gap-4">
          {compounds.map((compound) => (
            <CompoundCard
              key={compound.id}
              id={compound.id}
              name={compound.name}
              smiles={compound.smiles_string}
              onDelete={handleDelete}
              onShare={handleShare}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
