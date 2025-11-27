import * as React from "react";
import type { DawaAddress } from "../services/dawa";
import { searchAddress } from "../services/dawa";
import { Search } from "lucide-react";

interface AddressSearchProps {
  onSelect: (coords: [number, number], address: string) => void;
}

export const AddressSearch: React.FC<AddressSearchProps> = ({ onSelect }) => {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<DawaAddress[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length >= 2) {
        try {
          const data = await searchAddress(query);
          setResults(data);
          setIsOpen(true);
        } catch (e) {
          console.error(e);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative w-full max-w-md z-50">
      <div className="relative">
        <input
          type="text"
          className="w-full p-4 pl-12 rounded-xl border-none shadow-lg bg-white/90 backdrop-blur-sm text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          placeholder="Indtast din adresse..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
        />
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute w-full mt-2 bg-white/95 backdrop-blur-md rounded-xl shadow-xl max-h-60 overflow-y-auto border border-gray-100">
          {results.map((item) => (
            <li
              key={item.adresse.id}
              className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-none transition-colors text-gray-900"
              onClick={() => {
                onSelect([item.adresse.x, item.adresse.y], item.tekst);
                setQuery(item.tekst);
                setIsOpen(false);
              }}
            >
              {item.tekst}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
