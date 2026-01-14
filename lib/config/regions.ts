/**
 * Multi-region configuration for the Mondoo platform.
 * Each region has its own GraphQL endpoint.
 */

export interface Region {
  id: string;
  name: string;
  endpoint: string;
  description: string;
}

export const REGIONS: Region[] = [
  {
    id: "us",
    name: "US",
    endpoint: "https://us.api.mondoo.com/query",
    description: "United States",
  },
  {
    id: "eu",
    name: "EU",
    endpoint: "https://eu.api.mondoo.com/query",
    description: "European Union",
  },
];

export const DEFAULT_REGION = REGIONS[0];

/**
 * Get region by ID
 */
export function getRegionById(id: string): Region | undefined {
  return REGIONS.find((r) => r.id === id);
}

/**
 * Get region endpoint
 */
export function getRegionEndpoint(regionId: string): string {
  const region = getRegionById(regionId);
  return region?.endpoint || DEFAULT_REGION.endpoint;
}
