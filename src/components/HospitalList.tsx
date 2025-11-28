import * as React from "react";
import type { Hospital } from "../types";
import { Clock, Navigation } from "lucide-react";

interface HospitalListProps {
  hospitals: Hospital[];
  onSelect: (hospital: Hospital) => void;
  selectedId?: string;
  onHover?: (hospital: Hospital | null) => void;
}

export const HospitalList: React.FC<HospitalListProps> = ({
  hospitals,
  onSelect,
  selectedId,
  onHover,
}) => {
  if (hospitals.length === 0) return null;

  // Sort by duration if available, otherwise distance
  const sorted = [...hospitals].sort((a, b) => {
    if (a.duration && b.duration) return a.duration - b.duration;
    if (a.distance && b.distance) return a.distance - b.distance;
    return 0;
  });

  return (
    <div className="w-full max-w-md mt-6 space-y-3 z-30">
      {sorted.map((hospital) => (
        <div
          key={hospital.id}
          className={`p-4 rounded-xl bg-white/90 backdrop-blur-sm cursor-pointer transition-all hover:scale-[1.02] border-2 ${
            selectedId === hospital.id
              ? "border-blue-500 ring-2 ring-blue-200"
              : "border-transparent"
          }`}
          onClick={() => onSelect(hospital)}
          onMouseEnter={() => onHover?.(hospital)}
          onMouseLeave={() => onHover?.(null)}
        >
          <h3 className="font-bold text-gray-800">{hospital.name}</h3>
          <p className="text-sm text-gray-500 mb-2">{hospital.address}</p>

          <div className="flex items-center gap-4 text-sm font-medium">
            {hospital.distance !== undefined && (
              <div className="flex items-center gap-1 text-blue-600">
                <Navigation size={16} />
                <span>{(hospital.distance / 1000).toFixed(1)} km</span>
              </div>
            )}
            {hospital.duration !== undefined && (
              <div className="flex items-center gap-1 text-green-600">
                <Clock size={16} />
                <span>{Math.round(hospital.duration / 60)} min</span>
              </div>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {hospital.specialties.map((s) => (
              <span
                key={s}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
