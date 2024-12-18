import { useEffect, useState } from "react";
import Header from "./Header";

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
        <ul className="space-y-4">
          {compounds.map((compound) => (
            <li
              key={compound.id}
              className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
            >
              <h3 className="text-lg font-semibold">{compound.name}</h3>
              <p className="text-sm text-gray-600">
                SMILES String: {compound.smiles_string}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
