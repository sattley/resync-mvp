import { useEffect, useState } from "react";
import Header from "./Header";
import SearchInput from "./SearchInput";
import CompoundCard from "./CompoundCard";
import {
  fetchCompounds,
  fetchCompoundName,
  saveCompound,
  fetchUsers,
  shareCompound,
} from "../api/compoundService";
import Toast from "./Toast";
import Modal from "./Modal";

interface Compound {
  id: number;
  name: string;
  smiles_string: string;
}

interface User {
  id: number;
  username: string;
}

const Dashboard = () => {
  const [compounds, setCompounds] = useState<Compound[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState<Compound | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentCompound, setCurrentCompound] = useState<Compound | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (message: string, type: "success" | "error") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null); // Automatically hide after 3 seconds
    }, 3000);
  };

  useEffect(() => {
    const loadCompounds = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        showToast("User not logged in. Redirecting to login.", "error");
        window.location.href = "/login"; // Redirect to login if no token
        return;
      }

      try {
        const data = await fetchCompounds(token);
        setCompounds(data);
      } catch (err) {
        showToast((err as Error).message, "error");
      }
    };

    loadCompounds();
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        showToast("User not logged in. Redirecting to login.", "error");
        return;
      }

      try {
        const usersData = await fetchUsers(token);
        setUsers(usersData);
      } catch (error) {
        showToast("Failed to load users. Please try again later.", "error");
      }
    };

    loadUsers();
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
      showToast("Please enter a SMILES string before searching.", "error");
      setSearchResult(null); // Clear any existing results
      return;
    }

    try {
      // Check if the molecule already exists in the user's dashboard
      const existingCompound = compounds.find(
        (compound) => compound.smiles_string === searchQuery
      );

      if (existingCompound) {
        showToast("This compound is already in your dashboard.", "error");
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
      showToast("Invalid SMILES string. Please try again.", "error");
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
        // Remove the deleted compound from the state
        setCompounds((prevCompounds) =>
          prevCompounds.filter((compound) => compound.id !== id)
        );
        showToast("Compound deleted successfully!", "success");
      } else {
        showToast("Failed to delete the compound. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error deleting compound:", error);
      showToast("An error occurred while deleting the compound.", "error");
    }
  };

  const handleShareClick = (compound: Compound) => {
    setCurrentCompound(compound);
    setShowModal(true);
  };

  const handleShareCompound = async (
    compoundId: number | undefined,
    userId: number
  ) => {
    if (!compoundId) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      showToast("User not logged in.", "error");
      return;
    }

    try {
      await shareCompound(compoundId, userId, token);

      showToast("Compound shared successfully!", "success");
      setShowModal(false);
      setSelectedUser(null);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("User already has this compound")) {
          showToast("This user already has this compound.", "error");
        } else {
          showToast("Failed to share the compound. Please try again.", "error");
        }
      } else {
        showToast("An unknown error occurred.", "error");
      }
    }
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
        {toastMessage && (
          <Toast
            message={toastMessage}
            type={toastType}
            onClose={() => setToastMessage(null)}
          />
        )}

        <SearchInput
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          onSearch={handleSearch}
        />

        {searchResult && (
          <div className="mb-20">
            <h3 className="text-lg font-bold mb-4">Search Result:</h3>
            <div className="flex">
              <CompoundCard
                id={searchResult.id}
                name={searchResult.name}
                smiles={searchResult.smiles_string}
                onSave={async (id, name, smiles) => {
                  try {
                    const token = localStorage.getItem("access_token");
                    if (!token) {
                      showToast("User not logged in.", "error");
                      return;
                    }

                    // Call saveCompound API
                    const savedCompound = await saveCompound(
                      { name, smiles_string: smiles },
                      token
                    );

                    // Add saved compound to the state
                    setCompounds((prev) => [...prev, savedCompound]);

                    // Clear search result after saving
                    setSearchResult(null);
                    setSearchQuery(""); // Clear the search input

                    showToast(
                      "Compound successfully saved to your dashboard!",
                      "success"
                    );
                  } catch (error) {
                    console.error("Error saving compound:", error);
                    showToast(
                      "Failed to save the compound. Please try again.",
                      "error"
                    );
                  }
                }}
              />
            </div>
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
              onShare={() => handleShareClick(compound)}
            />
          ))}
        </div>
        {/* Modal for sharing */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Share Compound"
        >
          <p className="mb-4">
            Share {currentCompound?.name.toUpperCase()} with another user?
          </p>
          <label className="block text-md font-bold my-2">Select a user:</label>
          <select
            value={selectedUser?.id || ""}
            onChange={(e) => {
              const userId = Number(e.target.value);
              const user = users.find((user) => user.id === userId) || null;
              setSelectedUser(user);
            }}
            className="block w-full p-2 border rounded mb-4"
          >
            <option value="">Select a user...</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              if (!selectedUser) {
                showToast(
                  "Please select a user to share the compound with.",
                  "error"
                );
                return;
              }

              handleShareCompound(currentCompound?.id, selectedUser.id);
            }}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Share
          </button>
        </Modal>
      </div>
    </div>
  );
};

export default Dashboard;
