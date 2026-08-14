/**
 * javari Barrels - Open Brewery DB Integration
 * 
 * Provides brewery location data for discovery features
 * https://www.openbrewerydb.org/documentation
 */

export interface Brewery {
  id: string;
  name: string;
  brewery_type: BreweryType;
  address_1: string | null;
  address_2: string | null;
  address_3: string | null;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  longitude: number | null;
  latitude: number | null;
  phone: string | null;
  website_url: string | null;
  state: string;
  street: string | null;
}

export type BreweryType = 
  | 'micro'      // Most craft breweries
  | 'nano'       // Extremely small breweries
  | 'regional'   // Regional location of an expanded brewery
  | 'brewpub'    // Brewery with restaurant/bar
  | 'large'      // Large, mass production brewery
  | 'planning'   // In planning, not yet opened
  | 'bar'        // Bar with beer focus
  | 'contract'   // Contract brewing company
  | 'proprietor' // Alternating proprietor brewery
  | 'closed';    // No longer in operation

export interface BrewerySearchParams {
  by_city?: string;
  by_country?: string;
  by_dist?: string;      // "latitude,longitude"
  by_ids?: string;       // Comma-separated IDs
  by_name?: string;
  by_state?: string;
  by_postal?: string;
  by_type?: BreweryType;
  page?: number;
  per_page?: number;     // Max 200
  sort?: 'asc' | 'desc';
}

const BASE_URL = 'https://api.openbrewerydb.org/v1/breweries';

/**
 * Build query string from params
 */
function buildQuery(params: BrewerySearchParams): string {
  const searchParams = new URLSearchParams();
  
  if (params.by_city) searchParams.set('by_city', params.by_city);
  if (params.by_country) searchParams.set('by_country', params.by_country);
  if (params.by_dist) searchParams.set('by_dist', params.by_dist);
  if (params.by_ids) searchParams.set('by_ids', params.by_ids);
  if (params.by_name) searchParams.set('by_name', params.by_name);
  if (params.by_state) searchParams.set('by_state', params.by_state);
  if (params.by_postal) searchParams.set('by_postal', params.by_postal);
  if (params.by_type) searchParams.set('by_type', params.by_type);
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.per_page) searchParams.set('per_page', Math.min(params.per_page, 200).toString());
  if (params.sort) searchParams.set('sort', params.sort);
  
  return searchParams.toString();
}

/**
 * List breweries with optional filters
 */
export async function listBreweries(params: BrewerySearchParams = {}): Promise<Brewery[]> {
  const query = buildQuery(params);
  const url = query ? `${BASE_URL}?${query}` : BASE_URL;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to list breweries: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get single brewery by ID
 */
export async function getBreweryById(id: string): Promise<Brewery | null> {
  const response = await fetch(`${BASE_URL}/${id}`);
  
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error(`Failed to get brewery: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Search breweries by keyword
 */
export async function searchBreweries(query: string): Promise<Brewery[]> {
  const response = await fetch(`${BASE_URL}/search?query=${encodeURIComponent(query)}`);
  
  if (!response.ok) {
    throw new Error(`Failed to search breweries: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get autocomplete suggestions
 */
export async function autocompleteBreweries(query: string): Promise<Brewery[]> {
  const response = await fetch(`${BASE_URL}/autocomplete?query=${encodeURIComponent(query)}`);
  
  if (!response.ok) {
    throw new Error(`Failed to autocomplete: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get random brewery
 */
export async function getRandomBrewery(): Promise<Brewery | null> {
  const response = await fetch(`${BASE_URL}/random`);
  
  if (!response.ok) {
    throw new Error(`Failed to get random brewery: ${response.status}`);
  }
  
  const data = await response.json();
  return data[0] || null;
}

/**
 * Get multiple random breweries
 */
export async function getRandomBreweries(count: number = 5): Promise<Brewery[]> {
  const response = await fetch(`${BASE_URL}/random?size=${Math.min(count, 50)}`);
  
  if (!response.ok) {
    throw new Error(`Failed to get random breweries: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get breweries near a location
 */
export async function getBreweriesNear(
  latitude: number,
  longitude: number,
  limit: number = 20
): Promise<Brewery[]> {
  return listBreweries({
    by_dist: `${latitude},${longitude}`,
    per_page: limit
  });
}

/**
 * Get breweries by city
 */
export async function getBreweriesByCity(
  city: string,
  state?: string
): Promise<Brewery[]> {
  const params: BrewerySearchParams = { by_city: city };
  if (state) params.by_state = state;
  return listBreweries(params);
}

/**
 * Get breweries by state
 */
export async function getBreweriesByState(
  state: string,
  type?: BreweryType
): Promise<Brewery[]> {
  const params: BrewerySearchParams = { by_state: state };
  if (type) params.by_type = type;
  return listBreweries(params);
}

/**
 * Get craft breweries only (micro, nano, brewpub)
 */
export async function getCraftBreweries(params: BrewerySearchParams = {}): Promise<Brewery[]> {
  // Fetch all craft types
  const [micro, nano, brewpub] = await Promise.all([
    listBreweries({ ...params, by_type: 'micro', per_page: 100 }),
    listBreweries({ ...params, by_type: 'nano', per_page: 100 }),
    listBreweries({ ...params, by_type: 'brewpub', per_page: 100 })
  ]);
  
  return [...micro, ...nano, ...brewpub];
}

/**
 * Get metadata for display
 */
export function getBreweryTypeLabel(type: BreweryType): string {
  const labels: Record<BreweryType, string> = {
    micro: 'Craft Brewery',
    nano: 'Nano Brewery',
    regional: 'Regional Brewery',
    brewpub: 'Brewpub',
    large: 'Large Brewery',
    planning: 'Coming Soon',
    bar: 'Beer Bar',
    contract: 'Contract Brewer',
    proprietor: 'Proprietor Brewery',
    closed: 'Closed'
  };
  
  return labels[type] || 'Brewery';
}

/**
 * Format address
 */
export function formatBreweryAddress(brewery: Brewery): string {
  const parts = [
    brewery.street || brewery.address_1,
    brewery.city,
    brewery.state_province,
    brewery.postal_code
  ].filter(Boolean);
  
  return parts.join(', ');
}

/**
 * Get Google Maps URL
 */
export function getBreweryMapsUrl(brewery: Brewery): string {
  if (brewery.latitude && brewery.longitude) {
    return `https://www.google.com/maps/search/?api=1&query=${brewery.latitude},${brewery.longitude}`;
  }
  
  const address = formatBreweryAddress(brewery);
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

/**
 * Calculate distance between two points (Haversine formula)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Sort breweries by distance from a point
 */
export function sortBreweriesByDistance(
  breweries: Brewery[],
  latitude: number,
  longitude: number
): (Brewery & { distance: number })[] {
  return breweries
    .filter(b => b.latitude && b.longitude)
    .map(brewery => ({
      ...brewery,
      distance: calculateDistance(
        latitude,
        longitude,
        brewery.latitude!,
        brewery.longitude!
      )
    }))
    .sort((a, b) => a.distance - b.distance);
}
