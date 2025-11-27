export interface DawaAddress {
  tekst: string;
  adresse: {
    id: string;
    vejnavn: string;
    husnr: string;
    postnr: string;
    postnrnavn: string;
    x: number; // long
    y: number; // lat
  };
}

export const searchAddress = async (query: string): Promise<DawaAddress[]> => {
  if (!query || query.length < 2) return [];

  const response = await fetch(
    `https://api.dataforsyningen.dk/adresser/autocomplete?q=${encodeURIComponent(
      query
    )}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch addresses");
  }

  const data = await response.json();
  return data;
};
