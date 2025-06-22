// Dropzone.tsx
import React, { useState } from "react";

interface DropzoneProps {
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
}

const Dropzone: React.FC<DropzoneProps> = ({
  selectedFile,
  setSelectedFile,
}) => {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <label
      htmlFor="dropzone-file"
      className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer
        ${
          selectedFile
            ? "border-green-500 bg-green-50 dark:bg-green-900"
            : isDragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
            : "border-gray-300 bg-gray-50 dark:bg-gray-700"
        }
        dark:hover:bg-gray-800 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ transition: "all 0.2s" }}
    >
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        {selectedFile ? (
          <>
            <svg
              className="w-8 h-8 mb-4 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="mb-2 text-sm font-semibold text-green-700 dark:text-green-300">
              {selectedFile.name}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              File uploaded successfully
            </p>
          </>
        ) : isDragActive ? (
          <span className="text-blue-600 font-semibold text-lg">
            Drop file here
          </span>
        ) : (
          <>
            <svg
              className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and
              drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              CSV (MAX. 2MB)
            </p>
          </>
        )}
      </div>
      <input
        id="dropzone-file"
        type="file"
        className="hidden"
        accept=".csv"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
          }
        }}
      />
    </label>
  );
};

export default Dropzone;
