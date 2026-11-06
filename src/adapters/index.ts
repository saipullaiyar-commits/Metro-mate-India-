/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MetroAdapter, LatLng } from '../types';
import { DelhiAdapter } from './delhi';
import { BengaluruAdapter } from './bengaluru';
import { MumbaiAdapter } from './mumbai';
import { KolkataAdapter } from './kolkata';
import { ChennaiAdapter } from './chennai';
import { HyderabadAdapter } from './hyderabad';
import { KochiAdapter } from './kochi';
import { regionalAdapters } from './regionalCities';
import { GenericGoogleTransitAdapter } from './generic';
import { calculateDistanceKm } from './helper';

export const allAdapters: Record<string, MetroAdapter> = {
  delhi: DelhiAdapter,
  mumbai: MumbaiAdapter,
  bengaluru: BengaluruAdapter,
  chennai: ChennaiAdapter,
  kolkata: KolkataAdapter,
  hyderabad: HyderabadAdapter,
  kochi: KochiAdapter,
  pune: regionalAdapters['pune'],
  nagpur: regionalAdapters['nagpur'],
  lucknow: regionalAdapters['lucknow'],
  ahmedabad: regionalAdapters['ahmedabad'],
  jaipur: regionalAdapters['jaipur'],
  kanpur: regionalAdapters['kanpur'],
  agra: regionalAdapters['agra'],
  bhopal: regionalAdapters['bhopal'],
  indore: regionalAdapters['indore'],
};

export const genericAdapter = new GenericGoogleTransitAdapter();

export function getAdapter(cityId: string): MetroAdapter {
  return allAdapters[cityId] || genericAdapter;
}

export function getAllCities(): { id: string; name: string; nativeName: string; operator: string }[] {
  return Object.values(allAdapters).map((a) => ({
    id: a.cityId,
    name: a.displayName,
    nativeName: a.nativeName,
    operator: a.operator,
  }));
}

// Find city matching coordinates by bounding box, falling back to closest city center
export function detectCityByLocation(loc: LatLng): MetroAdapter {
  const { lat, lng } = loc;

  // 1. Check exact bounds
  for (const adapter of Object.values(allAdapters)) {
    const b = adapter.bounds;
    if (lat <= b.north && lat >= b.south && lng <= b.east && lng >= b.west) {
      return adapter;
    }
  }

  // 2. Find closest city center
  let closestAdapter: MetroAdapter = DelhiAdapter;
  let minDistance = Infinity;

  for (const adapter of Object.values(allAdapters)) {
    const dist = calculateDistanceKm(lat, lng, adapter.center.lat, adapter.center.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestAdapter = adapter;
    }
  }

  // If within 150 km of nearest metro city, assign that city
  if (minDistance <= 150) {
    return closestAdapter;
  }

  return closestAdapter; // default to closest city
}
