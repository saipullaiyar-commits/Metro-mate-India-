/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { create } from 'zustand';
import { MetroAdapter, Station, Line, Arrival, ActiveTrip, StationLayout, ParsedPhysicalTicket } from '../types';
import { getAdapter, allAdapters, detectCityByLocation } from '../adapters';
import { getCachedStations, saveCachedStations, getCachedLines, saveCachedLines } from '../services/cache/db';
import { LocationState, locationEngine } from '../services/location/gps';

export type TabType = 'explore' | 'map' | 'ticket_ai' | 'wallet' | 'walk' | 'ride';
export type LanguageChoice = 'en' | 'hi' | 'native';

interface MetroState {
  // Navigation & View
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;

  // City & Operator
  activeCityId: string;
  activeAdapter: MetroAdapter;
  setCity: (cityId: string) => Promise<void>;

  // Data Collections
  stations: Station[];
  lines: Line[];
  activeStation: Station | null;
  selectedLineId: string | null;
  setActiveStation: (station: Station | null) => void;
  setSelectedLineId: (lineId: string | null) => void;

  // Arrivals & Freshness
  arrivals: Arrival[];
  lastArrivalsUpdate: number;
  isLoadingArrivals: boolean;
  refreshArrivals: () => Promise<void>;

  // Location & Sensors
  locationState: LocationState;
  isGpsInitialized: boolean;
  initializeLocation: () => void;
  simulateAtStation: boolean;
  setSimulateAtStation: (simulate: boolean) => void;

  // Physical Ticket AI Navigation
  parsedPhysicalTicket: ParsedPhysicalTicket | null;
  setParsedPhysicalTicket: (ticket: ParsedPhysicalTicket | null) => void;

  // 3D Walk Navigation (Accessible only when at/approaching station)
  activeStationLayout: StationLayout | null;
  targetPlatformId: string | null;
  loadStationLayout: (stationId: string) => Promise<void>;
  setTargetPlatformId: (platformId: string | null) => void;

  // In-Train Companion (Accessible only when boarded)
  activeTrip: ActiveTrip | null;
  startTrip: (originStationId: string, destStationId: string, lineId: string) => void;
  updateTripStation: (stationIndex: number) => void;
  endTrip: () => void;
  setCarriagePosition: (pos: 'standing' | 'sitting') => void;

  // App Settings
  language: LanguageChoice;
  setLanguage: (lang: LanguageChoice) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  quotaWarning: boolean;
  setQuotaWarning: (warn: boolean) => void;

  // Config
  googleMapsApiKey: string;
  setGoogleMapsApiKey: (key: string) => void;
}

export const useMetroStore = create<MetroState>((set, get) => {
  const initialAdapter = allAdapters['delhi'];

  return {
    activeTab: 'explore',
    setActiveTab: (tab) => set({ activeTab: tab }),

    activeCityId: 'delhi',
    activeAdapter: initialAdapter,
    setCity: async (cityId) => {
      const adapter = getAdapter(cityId);
      set({ activeCityId: cityId, activeAdapter: adapter });

      let stns = await getCachedStations(cityId);
      if (!stns) {
        stns = await adapter.getStations();
        saveCachedStations(stns);
      }

      let lns = await getCachedLines(cityId);
      if (!lns) {
        lns = await adapter.getLines();
        saveCachedLines(lns);
      }

      locationEngine.setStations(stns);

      const defaultStation = stns[0] || null;
      set({
        stations: stns,
        lines: lns,
        activeStation: defaultStation,
        selectedLineId: lns[0]?.id || null,
      });

      if (defaultStation) {
        get().refreshArrivals();
        get().loadStationLayout(defaultStation.id);
      }
    },

    stations: [],
    lines: [],
    activeStation: null,
    selectedLineId: null,
    setActiveStation: (station) => {
      set({ activeStation: station });
      if (station) {
        get().refreshArrivals();
        get().loadStationLayout(station.id);
      }
    },
    setSelectedLineId: (lineId) => set({ selectedLineId: lineId }),

    arrivals: [],
    lastArrivalsUpdate: Date.now(),
    isLoadingArrivals: false,
    refreshArrivals: async () => {
      const { activeStation, activeAdapter } = get();
      if (!activeStation) return;
      set({ isLoadingArrivals: true });
      try {
        const arrs = await activeAdapter.getArrivals(activeStation.id);
        set({
          arrivals: arrs,
          lastArrivalsUpdate: Date.now(),
          isLoadingArrivals: false,
        });
      } catch (err) {
        set({ isLoadingArrivals: false });
      }
    },

    locationState: {
      coords: null,
      accuracy: null,
      speedKmh: 0,
      heading: null,
      isIndoor: false,
      geofenceState: 'OUTSIDE',
      nearestStation: null,
      nearestStationDistM: Infinity,
      permissionStatus: 'prompt',
      errorMessage: null,
    },
    isGpsInitialized: false,
    initializeLocation: () => {
      if (get().isGpsInitialized) return;
      set({ isGpsInitialized: true });

      locationEngine.subscribe((loc) => {
        set({ locationState: loc });

        if (loc.coords && loc.accuracy && loc.accuracy < 100) {
          const detected = detectCityByLocation(loc.coords);
          if (detected.cityId !== get().activeCityId) {
            get().setCity(detected.cityId);
          }
        }

        if (loc.nearestStation && (!get().activeStation || loc.geofenceState === 'INSIDE')) {
          set({ activeStation: loc.nearestStation });
        }
      });

      locationEngine.startWatching();
    },

    simulateAtStation: false,
    setSimulateAtStation: (simulate) => set({ simulateAtStation: simulate }),

    parsedPhysicalTicket: null,
    setParsedPhysicalTicket: (ticket) => set({ parsedPhysicalTicket: ticket }),

    activeStationLayout: null,
    targetPlatformId: 'platform-1',
    loadStationLayout: async (stationId: string) => {
      const { activeAdapter } = get();
      const layout = await activeAdapter.getStationLayout(stationId);
      set({ activeStationLayout: layout });
    },
    setTargetPlatformId: (platformId) => set({ targetPlatformId: platformId }),

    activeTrip: null,
    startTrip: (originStationId, destStationId, lineId) => {
      const { stations } = get();
      const orig = stations.find((s) => s.id === originStationId);
      const dest = stations.find((s) => s.id === destStationId);
      if (!orig || !dest) return;

      const newTrip: ActiveTrip = {
        originStationId,
        destStationId,
        lineId,
        currentStationId: originStationId,
        nextStationId: destStationId,
        stopsRemaining: 4,
        totalStops: 4,
        isBoarded: true,
        carriagePosition: 'sitting',
        speedKmh: 34,
        doorOpeningSide: 'LEFT',
        estimatedArrivalTimestamp: Date.now() + 12 * 60 * 1000,
      };

      set({ activeTrip: newTrip, activeTab: 'ride' });
    },
    updateTripStation: (stationIndex) => {
      const trip = get().activeTrip;
      if (!trip) return;
      const remaining = Math.max(0, trip.totalStops - stationIndex);
      set({
        activeTrip: {
          ...trip,
          stopsRemaining: remaining,
          doorOpeningSide: remaining % 2 === 0 ? 'LEFT' : 'RIGHT',
        },
      });
    },
    endTrip: () => set({ activeTrip: null, activeTab: 'explore' }),
    setCarriagePosition: (pos) => {
      const trip = get().activeTrip;
      if (trip) set({ activeTrip: { ...trip, carriagePosition: pos } });
    },

    language: 'en',
    setLanguage: (lang) => set({ language: lang }),
    isDarkMode: false, // Default to clean modern light mode matching Image 3!
    toggleDarkMode: () => {
      const next = !get().isDarkMode;
      set({ isDarkMode: next });
      if (typeof document !== 'undefined') {
        if (next) document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
      }
    },
    quotaWarning: false,
    setQuotaWarning: (warn) => set({ quotaWarning: warn }),

    googleMapsApiKey: '',
    setGoogleMapsApiKey: (key) => set({ googleMapsApiKey: key }),
  };
});
