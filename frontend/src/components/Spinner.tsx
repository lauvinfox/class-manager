// Spinner.tsx
import React from "react";

interface SpinnerProps {
  size?: string; // Opsional, menentukan ukuran spinner
  color?: string; // Opsional, menentukan warna spinner
}

const Spinner: React.FC<SpinnerProps> = ({
  size = "w-8 h-8",
  color = "border-blue-500",
}) => {
  return (
    <div className={`flex justify-center items-center ${size}`}>
      <div
        className={`border-4 border-t-4 border-transparent ${color} rounded-full animate-spin`}
        style={{
          width: "100%",
          height: "100%",
        }}
      ></div>
    </div>
  );
};

export default Spinner;
