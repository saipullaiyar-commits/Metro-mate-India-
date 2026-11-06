/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MetroAdapter, Station, Line, Arrival, Fare, TicketingGuide, StationLayout } from '../types';
import { calculateDistanceKm, createDefaultStationLayout, generateHeadwayArrivals } from './helper';

export const mumbaiStations: Station[] = [
  {
    id: 'mum-ghatkopar',
    name: 'Ghatkopar Railway Interchange',
    nativeName: 'घाटकोपर',
    cityId: 'mumbai',
    lines: ['mum-line-1'],
    coordinates: { lat: 19.0857, lng: 72.9082 },
    isInterchange: true,
    facilities: ['Direct Central Railway FOB', 'Auto Stand', 'Lifts', 'Toilets', 'Shopping'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'Railway Platform 1 FOB Direct Concourse', accessible: true },
      { gateNumber: 'Gate 2', streetName: 'LBS Marg / Ghatkopar West', accessible: true },
    ],
    firstTrain: '05:30 AM',
    lastTrain: '11:45 PM',
    platformCount: 2,
    layoutType: 'elevated',
    crowdLevel: 'HIGH',
  },
  {
    id: 'mum-andheri',
    name: 'Andheri Metro & Suburban Junction',
    nativeName: 'अंधेरी',
    cityId: 'mumbai',
    lines: ['mum-line-1'],
    coordinates: { lat: 19.1197, lng: 72.8468 },
    isInterchange: true,
    facilities: ['Western Railway Skybridge', 'Lifts', 'Escalators', 'Customer Care'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'Andheri Railway Station East FOB', accessible: true },
      { gateNumber: 'Gate 3', streetName: 'MV Road / Gundavali Connection', accessible: true },
    ],
    firstTrain: '05:30 AM',
    lastTrain: '11:45 PM',
    platformCount: 2,
    layoutType: 'elevated',
    crowdLevel: 'HIGH',
  },
  {
    id: 'mum-versova',
    name: 'Versova Terminal',
    nativeName: 'वर्सोवा',
    cityId: 'mumbai',
    lines: ['mum-line-1'],
    coordinates: { lat: 19.1306, lng: 72.8211 },
    isInterchange: false,
    facilities: ['Auto Stand', 'Lifts', 'Escalators', 'Toilets'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'JP Road / Seven Bungalows Bus Depot', accessible: true },
      { gateNumber: 'Gate 2', streetName: 'Versova Village Link Road', accessible: false },
    ],
    firstTrain: '05:30 AM',
    lastTrain: '11:30 PM',
    platformCount: 2,
    layoutType: 'elevated',
    crowdLevel: 'MODERATE',
  },
  {
    id: 'mum-bkc',
    name: 'Bandra Kurla Complex (BKC)',
    nativeName: 'बीकेसी (वांद्रे कुर्ला संकुल)',
    cityId: 'mumbai',
    lines: ['mum-line-3'],
    coordinates: { lat: 19.0657, lng: 72.8687 },
    isInterchange: false,
    facilities: ['Underground Concourse', 'Financial Hub Access', 'Multi-level Lifts', 'High-Speed Wi-Fi'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'G-Block / ICICI Bank Towers', accessible: true },
      { gateNumber: 'Gate 2', streetName: 'MMRDA Grounds / Jio World Centre', accessible: true },
    ],
    firstTrain: '06:30 AM',
    lastTrain: '10:30 PM',
    platformCount: 2,
    layoutType: 'underground',
    crowdLevel: 'HIGH',
  },
  {
    id: 'mum-gundavali',
    name: 'Gundavali (Western Express Highway)',
    nativeName: 'गुंदवली',
    cityId: 'mumbai',
    lines: ['mum-line-7'],
    coordinates: { lat: 19.1171, lng: 72.8533 },
    isInterchange: true,
    facilities: ['WEH Metro Line 1 Walkway', 'Lifts', 'Escalators', 'Feeder Buses'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'Western Express Highway / Andheri East', accessible: true },
    ],
    firstTrain: '06:00 AM',
    lastTrain: '10:45 PM',
    platformCount: 2,
    layoutType: 'elevated',
    crowdLevel: 'MODERATE',
  },
];

export const mumbaiLines: Line[] = [
  {
    id: 'mum-line-1',
    name: 'Line 1 (Blue Line)',
    nativeName: 'मार्ग १ (ब्लू लाइन)',
    cityId: 'mumbai',
    color: '#0284C7', // Vivid Blue
    textColor: '#FFFFFF',
    isUnderground: false,
    coachCount: 4,
    stations: ['mum-versova', 'mum-andheri', 'mum-ghatkopar'],
    operatorLivery: {
      primaryColor: '#0284C7',
      stripeColor: '#DC2626', // Blue and Red Mumbai Metro One livery
      bodyMaterial: 'white-aluminum',
      accentColor: '#BAE6FD',
    },
  },
  {
    id: 'mum-line-3',
    name: 'Line 3 (Aqua Line Underground)',
    nativeName: 'मार्ग ३ (अ‍ॅक्वा लाइन)',
    cityId: 'mumbai',
    color: '#0D9488', // Aqua Teal
    textColor: '#FFFFFF',
    isUnderground: true,
    coachCount: 8,
    stations: ['mum-bkc'],
    operatorLivery: {
      primaryColor: '#0D9488',
      stripeColor: '#047857',
      bodyMaterial: 'stainless-steel',
      accentColor: '#99F6E4',
    },
  },
  {
    id: 'mum-line-7',
    name: 'Line 7 (Red Line)',
    nativeName: 'मार्ग ७ (रेड लाइन)',
    cityId: 'mumbai',
    color: '#DC2626',
    textColor: '#FFFFFF',
    isUnderground: false,
    coachCount: 6,
    stations: ['mum-gundavali'],
    operatorLivery: {
      primaryColor: '#DC2626',
      stripeColor: '#991B1B',
      bodyMaterial: 'stainless-steel',
      accentColor: '#FECACA',
    },
  },
];

export const MumbaiAdapter: MetroAdapter = {
  cityId: 'mumbai',
  displayName: 'Mumbai Metro',
  nativeName: 'मुंबई मेट्रो (MMRDA / Metro One)',
  operator: 'Mumbai Metropolitan Region Development Authority (MMRDA)',
  languageCode: 'mr',
  center: { lat: 19.076, lng: 72.8777 },
  bounds: {
    north: 19.3,
    south: 18.88,
    east: 73.05,
    west: 72.75,
  },
  dataQuality: {
    realtime: true,
    staticSchedule: true,
    indoorMaps: true,
    fareApi: true,
  },
  async getStations(): Promise<Station[]> {
    return mumbaiStations;
  },
  async getLines(): Promise<Line[]> {
    return mumbaiLines;
  },
  async getArrivals(stationId: string): Promise<Arrival[]> {
    const station = mumbaiStations.find((s) => s.id === stationId);
    if (!station) return [];

    const arrivals: Arrival[] = [];
    if (station.lines.includes('mum-line-1')) {
      arrivals.push(
        ...generateHeadwayArrivals(stationId, 'mum-line-1', [
          { dest: 'Ghatkopar', platform: 'Platform 1' },
          { dest: 'Versova', platform: 'Platform 2' },
        ], 3.5)
      );
    }
    if (station.lines.includes('mum-line-3')) {
      arrivals.push(
        ...generateHeadwayArrivals(stationId, 'mum-line-3', [
          { dest: 'Aarey JVLR', platform: 'Platform 1' },
          { dest: 'BKC', platform: 'Platform 2' },
        ], 6)
      );
    }
    return arrivals.sort((a, b) => a.etaSeconds - b.etaSeconds);
  },
  async getFare(fromId: string, toId: string, mode: string): Promise<Fare> {
    const s1 = mumbaiStations.find((s) => s.id === fromId) || mumbaiStations[0];
    const s2 = mumbaiStations.find((s) => s.id === toId) || mumbaiStations[1];
    const dist = calculateDistanceKm(s1.coordinates.lat, s1.coordinates.lng, s2.coordinates.lat, s2.coordinates.lng);

    let token = 10;
    if (dist > 16) token = 40;
    else if (dist > 10) token = 30;
    else if (dist > 3) token = 20;

    const smartCard = Math.round(token * 0.9);
    const duration = Math.max(4, Math.round(dist * 2.3));

    return {
      tokenFare: token,
      smartCardFare: smartCard,
      durationMinutes: duration,
      distanceKm: dist,
      interchanges: s1.lines.some((l) => s2.lines.includes(l)) ? 0 : 1,
    };
  },
  async getStationLayout(stationId: string): Promise<StationLayout | null> {
    const s = mumbaiStations.find((x) => x.id === stationId);
    if (!s) return null;
    return createDefaultStationLayout(s);
  },
  getTicketingGuide(): TicketingGuide {
    return {
      methods: [
        {
          id: 'mumbai-1-qr',
          name: 'Mumbai 1 Mobile App / WhatsApp QR',
          description: 'Official WhatsApp ticketing (+91 9619022222 for Line 1 / +91 8652635500 for Lines 2A & 7).',
          icon: 'QrCode',
          supportedApps: ['Mumbai 1 App', 'WhatsApp', 'Paytm', 'Ridlr'],
        },
        {
          id: 'ncmc-card',
          name: 'Mumbai 1 NCMC Card',
          description: 'Single card for all metro lines, BEST buses, and suburban local trains.',
          icon: 'CreditCard',
          supportedApps: ['SBI Mumbai 1 Card', 'RuPay NCMC'],
        },
        {
          id: 'token-coin',
          name: 'Single Journey Contactless Token',
          description: 'Circular plastic token. Tap sensor on entry, deposit in slot at exit.',
          icon: 'Coins',
          supportedApps: ['Ticket Counter', 'Automatic Vending Machine'],
        },
      ],
      modes: ['qr', 'token', 'card'],
      tips: [
        'Direct foot-over-bridge from Central Railway suburban trains into Ghatkopar Metro concourse.',
        'Line 1 uses Mumbai Metro One ticketing; Lines 2A & 7 use MMMOCL Mumbai 1 system.',
      ],
      rules: [
        'Exit within 20 minutes at same station or 120 minutes across line.',
      ],
      mistakes: [
        'Do not mix Line 1 tokens with Line 2A/7 tokens—they operate on independent fare systems.',
      ],
    };
  },
};
