interface SearchInputProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  onSearch: () => void;
}

const SearchInput: React.FC<SearchInputProps> = ({
  searchQuery,
  onSearchQueryChange,
  onSearch,
}) => {
  return (
    <div className="mb-10">
      <label className="text-lg block font-bold mb-2">
        Search for a Compound (SMILES):
      </label>
      <div className="flex space-x-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          className="flex-grow p-2 border rounded"
          placeholder="Enter SMILES string"
        />
        <button
          onClick={onSearch}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Search
        </button>
      </div>
    </div>
  );
};

export default SearchInput;
