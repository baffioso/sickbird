import * as React from "react";
import Map, {
  Marker,
  NavigationControl,
  Popup,
  Source,
  Layer,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Hospital } from "../types";
import { MapPin } from "lucide-react";

interface MapComponentProps {
  userLocation: [number, number] | null;
  hospitals: Hospital[];
  selectedHospital: Hospital | null;
  onSelectHospital: (hospital: Hospital | null) => void;
  routeGeometry: [number, number][] | null;
}

const routeLayerStyle = {
  id: "route",
  type: "line" as const,
  paint: {
    "line-color": "#3B82F6",
    "line-width": 4,
    "line-opacity": 0.8,
  },
};

const regionOutlineStyle = {
  id: "region-outline",
  type: "line" as const,
  paint: {
    "line-color": "#59576eff",
    "line-width": 2,
    "line-opacity": 0.5,
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
    >
      <NavigationControl position="top-right" />

      {/* Danish Regions Layer */}
      {regionData && (
        <Source id="regions" type="geojson" data={regionData}>
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
            <MapPin size={32} fill="#3B82F6" stroke="white" strokeWidth={2} />
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
