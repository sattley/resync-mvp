import React from "react";

interface CompoundCardProps {
  id: number;
  name: string;
  smiles: string;
  onDelete?: (id: number) => void;
  onShare?: (id: number) => void;
  onSave?: (id: number, name: string, smiles: string) => void;
}

const CompoundCard: React.FC<CompoundCardProps> = ({
  id,
  name,
  smiles,
  onDelete,
  onShare,
  onSave,
}) => {
  const renderMolecule = () => {
    try {
      const mol = window.RDKit.get_mol(smiles);
      return mol.get_svg();
    } catch (error) {
      console.error("Error rendering SMILES string:", error);
      return `<p>Error rendering molecule</p>`;
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
      <h3 className="text-lg font-semibold">{name}</h3>
      <div
        className="molecule-svg my-4 border border-neutral-100 p-4 rounded-sm"
        dangerouslySetInnerHTML={{ __html: renderMolecule() }}
      />
      <div className="flex space-x-4">
        {onSave ? (
          <button
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            onClick={() => onSave(id, name, smiles)}
          >
            Save to Dashboard
          </button>
        ) : (
          <>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={() => onDelete && onDelete(id)}
            >
              Delete
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => onShare && onShare(id)}
            >
              Share
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CompoundCard;
