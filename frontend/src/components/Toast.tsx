interface ToastProps {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 p-4 rounded shadow-lg text-white z-50 ${
        type === "success" ? "bg-green-500" : "bg-red-500"
      }`}
    >
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-4 bg-transparent border-none text-white text-lg font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export default Toast;
