"use client";

type Color = "green" | "red" | "teal" | "orange" | "gray" | "blue" | "purple" | "yellow";

const colorMap: Record<Color, string> = {
  green: "bg-green-100 text-green-700 hover:bg-green-200",
  red: "bg-red-100 text-red-700 hover:bg-red-200",
  teal: "bg-teal-100 text-teal-700 hover:bg-teal-200",
  orange: "bg-orange-100 text-orange-700 hover:bg-orange-200",
  gray: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  blue: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  purple: "bg-purple-100 text-purple-700 hover:bg-purple-200",
  yellow: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
};

interface Props {
  children: React.ReactNode;
  onClick: () => void;
  color?: Color;
  fullWidth?: boolean;
}

export function ActionButton({ children, onClick, color = "gray", fullWidth = false }: Props) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${colorMap[color]} ${fullWidth ? "w-full text-left" : ""}`}
    >
      {children}
    </button>
  );
}
