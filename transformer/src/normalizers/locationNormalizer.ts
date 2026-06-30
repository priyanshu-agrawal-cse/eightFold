// Minimal mapping for ISO-3166 alpha-2
const COUNTRY_MAP: Record<string, string> = {
  'united states': 'US',
  'usa': 'US',
  'us': 'US',
  'united kingdom': 'GB',
  'uk': 'GB',
  'great britain': 'GB',
  'india': 'IN',
  'canada': 'CA',
  'australia': 'AU',
  'germany': 'DE',
  'france': 'FR',
};

export function normalizeCountry(country: string | null | undefined): string | null {
  if (!country) return null;
  const clean = country.trim().toLowerCase();
  if (COUNTRY_MAP[clean]) {
    return COUNTRY_MAP[clean];
  }
  // If it's already a 2-letter code, return uppercase
  if (clean.length === 2) {
    return clean.toUpperCase();
  }
  return country.trim();
}
