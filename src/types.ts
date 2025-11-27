export interface Hospital {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  specialties: string[];
  distance?: number; // in meters
  duration?: number; // in seconds
}
