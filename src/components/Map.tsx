import * as React from "react";
import Map, {
  Marker,
  NavigationControl,
  Source,
  Layer,
  type LayerProps,
  type MapRef,
} from "react-map-gl/maplibre";
import { LngLatBounds } from "maplibre-gl";
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

const labelLayerStyle: LayerProps = {
  id: "hospital-labels",
  type: "symbol" as const,
  layout: {
    "text-field": ["get", "name"],
    "text-anchor": "top",
    "text-offset": [0, 1.2],
    "text-size": 12,
  },
  paint: {
    "text-color": "#111827",
    "text-halo-color": "#ffffff",
    "text-halo-width": 2,
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
  const mapRef = React.useRef<MapRef>(null);
  const [regionData, setRegionData] = React.useState<any>(null);

  // Fetch Danish regions GeoJSON
  React.useEffect(() => {
    fetch("https://api.dataforsyningen.dk/regioner?format=geojson")
      .then((res) => res.json())
      .then((data) => setRegionData(data))
      .catch((err) => console.error("Failed to load regions:", err));
  }, []);

  // Auto-zoom to bounds
  React.useEffect(() => {
    if (!mapRef.current) return;

    if (userLocation && hospitals.length > 0) {
      const bounds = new LngLatBounds();

      // Add user location
      bounds.extend(userLocation);

      // Add all hospitals
      hospitals.forEach((h) => bounds.extend(h.coordinates));

      // Determine padding based on screen width (desktop has sidebar)
      const isDesktop = window.innerWidth >= 768;
      const padding = isDesktop
        ? { top: 50, bottom: 50, left: 520, right: 50 }
        : { top: 50, bottom: 350, left: 50, right: 50 }; // Mobile: more bottom padding for list

      mapRef.current.fitBounds(bounds, {
        padding,
        maxZoom: 15,
        duration: 1000,
      });
    }
  }, [userLocation, hospitals]);

  const allHospitalsGeoJSON = React.useMemo(() => {
    return {
      type: "FeatureCollection" as const,
      features: hospitals.map((hospital) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: hospital.coordinates,
        },
        properties: {
          name: hospital.name,
        },
      })),
    };
  }, [hospitals]);

  return (
    <Map
      ref={mapRef}
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
          <Layer {...regionFillStyle} beforeId="hospital-labels" />
          <Layer {...regionOutlineStyle} beforeId="hospital-labels" />
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
          <div className="relative flex items-center justify-center">
            {/* Shadow/base */}
            <div className="absolute -bottom-1 w-8 h-2 bg-black/20 rounded-full blur-sm"></div>

            {/* Main marker pin */}
            <div className="relative bg-blue-600 rounded-full p-1 shadow-lg">
              <User size={20} className="text-white" strokeWidth={2.5} />
            </div>

            {/* Pointer tip */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-blue-600"></div>
          </div>
        </Marker>
      )}

      {hospitals.map((hospital) => {
        const isSelected = selectedHospital?.id === hospital.id;
        return (
          <Marker
            key={hospital.id}
            longitude={hospital.coordinates[0]}
            latitude={hospital.coordinates[1]}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              onSelectHospital(hospital);
            }}
            style={{ zIndex: isSelected ? 10 : 1 }}
          >
            <div className="cursor-pointer transition-transform hover:scale-110">
              <MapPin
                size={32}
                fill={isSelected ? "#DC2626" : "#16A34A"}
                stroke="white"
                strokeWidth={2}
              />
            </div>
          </Marker>
        );
      })}

      {/* All Hospitals Label Layer */}
      <Source
        id="hospitals-label-source"
        type="geojson"
        data={allHospitalsGeoJSON}
      >
        <Layer {...labelLayerStyle} />
      </Source>
    </Map>
  );
};
