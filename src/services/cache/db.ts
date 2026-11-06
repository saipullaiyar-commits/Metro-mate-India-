/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Dexie, { Table } from 'dexie';
import { Station, Line, Arrival, SavedTicket } from '../../types';

export interface CachedArrival {
  stationId: string;
  arrivals: Arrival[];
  timestamp: number;
}

export class MetroMateDatabase extends Dexie {
  stations!: Table<Station, string>;
  lines!: Table<Line, string>;
  arrivalsCache!: Table<CachedArrival, string>;
  savedTickets!: Table<SavedTicket, string>;

  constructor() {
    super('MetroMateIndiaDB');
    this.version(1).stores({
      stations: 'id, cityId, isInterchange',
      lines: 'id, cityId',
      arrivalsCache: 'stationId, timestamp',
      savedTickets: 'id, savedAt, ticketId',
    });
  }
}

export const db = new MetroMateDatabase();

// Cache helper functions with stale-while-revalidate TTL
const TTL_ARRIVALS_MS = 60 * 1000; // 1 minute
const TTL_METRO_DATA_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function getCachedStations(cityId: string): Promise<Station[] | null> {
  try {
    const list = await db.stations.where('cityId').equals(cityId).toArray();
    return list.length > 0 ? list : null;
  } catch (e) {
    console.warn('IndexedDB read failed:', e);
    return null;
  }
}

export async function saveCachedStations(stations: Station[]): Promise<void> {
  try {
    await db.stations.bulkPut(stations);
  } catch (e) {
    console.warn('IndexedDB save failed:', e);
  }
}

export async function getCachedLines(cityId: string): Promise<Line[] | null> {
  try {
    const lines = await db.lines.where('cityId').equals(cityId).toArray();
    return lines.length > 0 ? lines : null;
  } catch (e) {
    console.warn('IndexedDB lines read failed:', e);
    return null;
  }
}

export async function saveCachedLines(lines: Line[]): Promise<void> {
  try {
    await db.lines.bulkPut(lines);
  } catch (e) {
    console.warn('IndexedDB save lines failed:', e);
  }
}

export async function getCachedArrivals(stationId: string): Promise<Arrival[] | null> {
  try {
    const cached = await db.arrivalsCache.get(stationId);
    if (!cached) return null;
    const isStale = Date.now() - cached.timestamp > TTL_ARRIVALS_MS;
    return cached.arrivals.map((a) => ({
      ...a,
      provenance: isStale ? 'OFFLINE-CACHED' : a.provenance,
    }));
  } catch (e) {
    return null;
  }
}

export async function saveCachedArrivals(stationId: string, arrivals: Arrival[]): Promise<void> {
  try {
    await db.arrivalsCache.put({
      stationId,
      arrivals,
      timestamp: Date.now(),
    });
  } catch (e) {
    console.warn('IndexedDB save arrivals failed:', e);
  }
}

export async function getAllSavedTickets(): Promise<SavedTicket[]> {
  try {
    return await db.savedTickets.orderBy('savedAt').reverse().toArray();
  } catch (e) {
    return [];
  }
}

export async function saveTicketToWallet(ticket: SavedTicket): Promise<void> {
  try {
    await db.savedTickets.put(ticket);
  } catch (e) {
    console.warn('IndexedDB save ticket failed:', e);
  }
}

export async function deleteTicketFromWallet(ticketId: string): Promise<void> {
  try {
    await db.savedTickets.delete(ticketId);
  } catch (e) {
    console.warn('IndexedDB delete ticket failed:', e);
  }
}
