import * as React from "react";
import Map, {
  Marker,
  NavigationControl,
  Popup,
  Source,
  Layer,
  type LayerProps,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Hospital } from "../types";
import { User, MapPin } from "lucide-react";

interface MapComponentProps {
  userLocation: [number, number] | null;
  hospitals: Hospital[];
  selectedHospital: Hospital | null;
  onSelectHospital: (hospital: Hospital | null) => void;
  routeGeometry: [number, number][] | null;
}

const routeLayerStyle: LayerProps = {
  id: "route",
  type: "line" as const,
  paint: {
    "line-color": "#3B82F6",
    "line-width": 4,
    "line-opacity": 0.8,
  },
};

const regionOutlineStyle: LayerProps = {
  id: "region-outline",
  type: "line" as const,
  paint: {
    "line-color": "#6f6e72ff",
    "line-width": 0.1,
    "line-opacity": 0.5,
  },
};

const regionFillStyle: LayerProps = {
  id: "region-fill",
  type: "fill" as const,
  paint: {
    "fill-color": [
      "match",
      ["get", "navn"],
      "Region Hovedstaden",
      "#3B82F6", // Blue
      "Region Sjælland",
      "#10B981", // Green
      "Region Syddanmark",
      "#F59E0B", // Amber
      "Region Midtjylland",
      "#8B5CF6", // Purple
      "Region Nordjylland",
      "#EF4444", // Red
      "#93C5FD", // Default fallback
    ],
    "fill-opacity": 0.15,
  },
};

export const MapComponent: React.FC<MapComponentProps> = ({
  userLocation,
  hospitals,
  selectedHospital,
  onSelectHospital,
  routeGeometry,
}) => {
  const [regionData, setRegionData] = React.useState<any>(null);

  // Fetch Danish regions GeoJSON
  React.useEffect(() => {
    fetch("https://api.dataforsyningen.dk/regioner?format=geojson")
      .then((res) => res.json())
      .then((data) => setRegionData(data))
      .catch((err) => console.error("Failed to load regions:", err));
  }, []);

  return (
    <Map
      initialViewState={{
        longitude: 11.8,
        latitude: 55.4,
        zoom: 8,
      }}
      style={{ width: "100%", height: "100%" }}
      mapStyle="https://api.maptiler.com/maps/dataviz/style.json?key=MZCjtFvEvhy0zEdhtmhp"
      onClick={() => onSelectHospital(null)}
    >
      <NavigationControl position="top-right" />

      {/* Danish Regions Layer */}
      {regionData && (
        <Source id="regions" type="geojson" data={regionData}>
          <Layer {...regionFillStyle} />
          <Layer {...regionOutlineStyle} />
        </Source>
      )}

      {/* Route Layer */}
      {routeGeometry && routeGeometry.length > 0 && (
        <Source
          id="route"
          type="geojson"
          data={{
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: routeGeometry,
            },
          }}
        >
          <Layer {...routeLayerStyle} />
        </Source>
      )}

      {userLocation && (
        <Marker
          longitude={userLocation[0]}
          latitude={userLocation[1]}
          anchor="bottom"
        >
          <div className="relative">
            <User size={40} fill="#3B82F6" stroke="white" strokeWidth={1} />
          </div>
        </Marker>
      )}

      {hospitals.map((hospital) => (
        <Marker
          key={hospital.id}
          longitude={hospital.coordinates[0]}
          latitude={hospital.coordinates[1]}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            onSelectHospital(hospital);
          }}
        >
          <div className="cursor-pointer transition-transform hover:scale-110">
            <MapPin
              size={32}
              fill={
                selectedHospital?.id === hospital.id ? "#DC2626" : "#16A34A"
              }
              stroke="white"
              strokeWidth={2}
            />
          </div>
        </Marker>
      ))}

      {selectedHospital && (
        <Popup
          longitude={selectedHospital.coordinates[0]}
          latitude={selectedHospital.coordinates[1]}
          anchor="top"
          onClose={() => onSelectHospital(null)}
          closeOnClick={false}
        >
          <div className="p-2 text-gray-900">
            <h3 className="font-bold text-gray-900">{selectedHospital.name}</h3>
            <p className="text-sm text-gray-700">{selectedHospital.address}</p>
          </div>
        </Popup>
      )}
    </Map>
  );
};
