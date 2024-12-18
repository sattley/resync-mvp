

const Header = ({ onLogout }: { onLogout: () => void }) => {
  return (
    <div className="bg-blue-600 text-white py-4 px-6 flex justify-between items-center shadow">
      <h1 className="text-2xl font-bold">Compound Dashboard</h1>
      <button
        onClick={onLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
};

export default Header;
