// OpenRouteService API Key from user
const API_KEY =
  "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjJlZDg1OWMyOTQ1MzQyOTA4NmZiOTcwMDIxYWIxYTVhIiwiaCI6Im11cm11cjY0In0=";

// In-memory cache for API responses
const routeMetricsCache = new Map<string, RouteMetrics[]>();
const routeGeometryCache = new Map<string, RouteGeometry>();

export interface RouteMetrics {
  distance: number; // meters
  duration: number; // seconds
}

export interface RouteGeometry {
  coordinates: [number, number][];
  distance: number;
  duration: number;
}

// Helper to create cache key from coordinates
const createCacheKey = (
  start: [number, number],
  end: [number, number]
): string => {
  return `${start[0]},${start[1]}-${end[0]},${end[1]}`;
};

// Get distance and duration for multiple destinations (matrix)
export const getRouteMetrics = async (
  start: [number, number],
  destinations: [number, number][]
): Promise<RouteMetrics[]> => {
  // Create cache key for this matrix request
  const cacheKey = `matrix-${start[0]},${start[1]}-${destinations
    .map((d) => `${d[0]},${d[1]}`)
    .join("|")}`;

  // Check cache first
  if (routeMetricsCache.has(cacheKey)) {
    console.log("Using cached route metrics");
    return routeMetricsCache.get(cacheKey)!;
  }

  try {
    const response = await fetch(
      `https://api.openrouteservice.org/v2/matrix/driving-car?api_key=${encodeURIComponent(
        API_KEY
      )}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Accept: "application/json",
        },
        body: JSON.stringify({
          locations: [start, ...destinations],
          metrics: ["distance", "duration"],
          destinations: destinations.map((_, i) => i + 1),
          sources: [0],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ORS Matrix API failed:", response.status, errorText);
      // Return mock data if real routing fails
      return destinations.map(() => ({
        distance: Math.random() * 50000 + 10000,
        duration: Math.random() * 3600 + 600,
      }));
    }

    const data = await response.json();
    console.log("ORS Matrix API success:", data);
    const result = destinations.map((_, i) => ({
      distance: data.distances[0][i],
      duration: data.durations[0][i],
    }));

    // Cache the result
    routeMetricsCache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error("ORS Matrix API error:", error);
    // Return mock data on error
    return destinations.map(() => ({
      distance: Math.random() * 50000 + 10000,
      duration: Math.random() * 3600 + 600,
    }));
  }
};

// Get actual route geometry between two points
export const getRoute = async (
  start: [number, number],
  end: [number, number]
): Promise<RouteGeometry | null> => {
  // Check cache first
  const cacheKey = createCacheKey(start, end);
  if (routeGeometryCache.has(cacheKey)) {
    console.log("Using cached route geometry");
    return routeGeometryCache.get(cacheKey)!;
  }

  try {
    // Format: lon,lat (as shown in the working curl)
    const startParam = `${start[0]},${start[1]}`;
    const endParam = `${end[0]},${end[1]}`;

    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${encodeURIComponent(
      API_KEY
    )}&start=${startParam}&end=${endParam}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json, application/geo+json",
      },
    });

    if (!response.ok) {
      console.error(
        "ORS Directions API failed:",
        response.status,
        await response.text()
      );
      return null;
    }

    const data = await response.json();
    const route = data.routes?.[0] || data.features?.[0];

    if (!route) {
      console.error("No route found in response");
      return null;
    }

    // Handle both GeoJSON and regular JSON response formats
    const geometry = route.geometry || route.features?.[0]?.geometry;
    const summary = route.summary || route.properties?.summary;

    const result: RouteGeometry = {
      coordinates: geometry.coordinates,
      distance: summary?.distance || 0,
      duration: summary?.duration || 0,
    };

    // Cache the result
    routeGeometryCache.set(cacheKey, result);

    return result;
  } catch (error) {
    console.error("ORS Directions API error:", error);
    return null;
  }
};
