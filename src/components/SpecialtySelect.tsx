import * as React from "react";
import specialties from "../data/specialties.json";
import { Stethoscope } from "lucide-react";

interface SpecialtySelectProps {
  selected: string;
  onSelect: (specialty: string) => void;
}

export const SpecialtySelect: React.FC<SpecialtySelectProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <div className="relative w-full max-w-md mt-4 z-40">
      <div className="relative">
        <select
          className="w-full p-4 pl-12 rounded-xl border-none shadow-lg bg-white/90 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer transition-all"
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
        >
          <option value="">Vælg undersøgelse / speciale...</option>
          {specialties.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <Stethoscope
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
      </div>
    </div>
  );
};
