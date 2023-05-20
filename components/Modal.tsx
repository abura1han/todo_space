import React, { useEffect, useState } from "react";

type ColumnState = "todo" | "in progress" | "done";

interface DefaultFormData {
  title?: string;
  description?: string;
}

interface ModalProps {
  isOpen: boolean;
  columnState: ColumnState;
  defaultFormData?: DefaultFormData;
  onClose: () => void;
  onSubmit: (
    e: React.SyntheticEvent,
    data: { title: string; description: string; columnState: ColumnState }
  ) => void;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  columnState,
  defaultFormData,
  onClose,
  onSubmit,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setTitle(defaultFormData?.title ?? "");
    setDescription(defaultFormData?.description ?? "");
  }, [defaultFormData?.description, defaultFormData?.title]);

  const handleResetForm = () => {
    setTitle("");
    setDescription("");
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={() => {
              handleResetForm();
              onClose();
            }}
          ></div>
          <form
            className="bg-white rounded-lg p-8 shadow-2xl z-20 flex flex-col gap-4"
            onSubmit={(e) => {
              onSubmit(e, { title, description, columnState });
              handleResetForm();
            }}
          >
            <input
              type="text"
              className="px-1 py-2 rounded border outline-transparent focus:outline-stone-500"
              placeholder="Title"
              required
              onChange={(e) => setTitle(e.target.value)}
              value={title}
            />
            <input
              type="text"
              className="px-1 py-2 rounded border outline-transparent focus:outline-stone-500"
              placeholder="Description"
              onChange={(e) => setDescription(e.target.value)}
              value={description}
            />
            <div className="flex items-center justify-end gap-5">
              <button
                className="mt-4 bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded"
                onClick={onClose}
                type="button"
              >
                Cancel
              </button>
              <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
                Submit
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Modal;
