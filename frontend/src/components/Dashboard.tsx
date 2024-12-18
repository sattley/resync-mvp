import { useEffect, useState } from "react";
import Header from "./Header";
import CompoundCard from "./CompoundCard";

interface Compound {
  id: number;
  name: string;
  smiles_string: string;
}

const Dashboard = () => {
  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompounds = async () => {
      const token = localStorage.getItem("access_token");

      try {
        const response = await fetch("http://127.0.0.1:8000/compounds", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch compounds");
        }

        const data = await response.json();
        setCompounds(data);
      } catch (err) {
        setError((err as Error).message);
      }
    };

    fetchCompounds();
  }, []);

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
        <h2 className="text-2xl font-bold mb-4">Your Compounds</h2>
        {error && <p className="text-red-500">{error}</p>}
        <div className="space-y-4">
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
