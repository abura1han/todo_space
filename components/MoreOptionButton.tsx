import { faEllipsis } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";

interface Props {
  onEdit: () => void;
  onDelete: () => void;
}

const MoreOptionButton = ({ onDelete, onEdit }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div className="relative">
      <button
        className="border px-2 py-1 rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FontAwesomeIcon icon={faEllipsis} className="text-accent-3" />
      </button>
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute top-0 right-0 mt-8 bg-white border border-gray-200 rounded-lg shadow-lg"
        >
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={onEdit}
          >
            Edit
          </button>
          <button
            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default MoreOptionButton;
