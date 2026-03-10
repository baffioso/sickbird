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
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    setQuery(selected);
  }, [selected]);

  const filtered = specialties.filter((s) =>
    s.toLowerCase().includes(query.trim().toLowerCase())
  );

  const handleSelect = (value: string) => {
    onSelect(value);
    setQuery(value);
  };

  return (
    <div className="relative w-full max-w-md mt-4 z-40">
      <div className="relative flex flex-col gap-2">
        <div className="relative">
          <input
            className="w-full p-4 pl-12 rounded-xl border border-white/50 bg-white/90 backdrop-blur-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Søg i undersøgelser / specialer..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Stethoscope
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>

        <div className="max-h-56 overflow-auto rounded-xl border border-white/50 bg-white/90 backdrop-blur-sm shadow-sm divide-y divide-gray-100/70">
          {(query ? filtered : specialties).map((s) => {
            const isSelected = s === selected;
            return (
              <button
                key={s}
                type="button"
                onClick={() => handleSelect(s)}
                className={`w-full text-left px-4 py-3 transition-colors ${
                  isSelected
                    ? "bg-blue-50 text-blue-700 font-semibold"
                    : "hover:bg-gray-50 text-gray-800"
                }`}
              >
                {s}
              </button>
            );
          })}
          {filtered.length === 0 && query.trim() ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              Ingen matchende specialer
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
