/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MetroAdapter, Station, Line, Arrival, Fare, TicketingGuide, StationLayout } from '../types';
import { calculateDistanceKm, createDefaultStationLayout, generateHeadwayArrivals } from './helper';

export const kochiStations: Station[] = [
  {
    id: 'cok-aluva',
    name: 'Aluva (Terminal)',
    nativeName: 'ആലുവ',
    cityId: 'kochi',
    lines: ['cok-cyan'],
    coordinates: { lat: 10.1098, lng: 76.3556 },
    isInterchange: false,
    facilities: ['Aluva Railway Station Skywalk', 'KSRTC Bus Depot Access', 'Lifts', 'Toilets'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'Aluva Flyover / Bypass Road', accessible: true },
      { gateNumber: 'Gate 2', streetName: 'KSRTC Bus Station Approach', accessible: true },
    ],
    firstTrain: '06:00 AM',
    lastTrain: '10:30 PM',
    platformCount: 2,
    layoutType: 'elevated',
    crowdLevel: 'HIGH',
  },
  {
    id: 'cok-edapally',
    name: 'Edapally (Lulu Mall Skywalk)',
    nativeName: 'ഇടപ്പള്ളി',
    cityId: 'kochi',
    lines: ['cok-cyan'],
    coordinates: { lat: 10.0253, lng: 76.3082 },
    isInterchange: false,
    facilities: ['Direct Air-Conditioned Skybridge to Lulu Mall', 'Lifts', 'Toilets'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'Lulu Mall Direct Pedestrian Airwalk', accessible: true },
      { gateNumber: 'Gate 2', streetName: 'Edapally Toll Junction Side', accessible: true },
    ],
    firstTrain: '06:15 AM',
    lastTrain: '10:45 PM',
    platformCount: 2,
    layoutType: 'elevated',
    crowdLevel: 'HIGH',
  },
  {
    id: 'cok-maharajas-college',
    name: 'Maharajas College (Water Metro Interchange)',
    nativeName: 'മഹാരാജാസ് കോളേജ്',
    cityId: 'kochi',
    lines: ['cok-cyan'],
    coordinates: { lat: 9.9733, lng: 76.2842 },
    isInterchange: true,
    facilities: ['Direct Link to High Court Water Metro Jetty', 'Feeder E-Autos', 'Lifts'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'MG Road / Maharajas College Ground', accessible: true },
      { gateNumber: 'Gate 2', streetName: 'Marine Drive / High Court Water Jetty Link', accessible: true },
    ],
    firstTrain: '06:20 AM',
    lastTrain: '10:40 PM',
    platformCount: 2,
    layoutType: 'elevated',
    crowdLevel: 'MODERATE',
  },
];

export const kochiLines: Line[] = [
  {
    id: 'cok-cyan',
    name: 'Cyan Line (Aluva - Thripunithura)',
    nativeName: 'സയൻ ലൈൻ',
    cityId: 'kochi',
    color: '#06B6D4',
    textColor: '#FFFFFF',
    isUnderground: false,
    coachCount: 3,
    stations: ['cok-aluva', 'cok-edapally', 'cok-maharajas-college'],
    operatorLivery: {
      primaryColor: '#06B6D4',
      stripeColor: '#0891B2',
      bodyMaterial: 'white-aluminum',
      accentColor: '#CFFAFE',
    },
  },
];

export const KochiAdapter: MetroAdapter = {
  cityId: 'kochi',
  displayName: 'Kochi Metro',
  nativeName: 'കൊച്ചി മെട്രോ (KMRL)',
  operator: 'Kochi Metro Rail Limited (KMRL)',
  languageCode: 'ml',
  center: { lat: 9.9816, lng: 76.2999 },
  bounds: {
    north: 10.2,
    south: 9.85,
    east: 76.45,
    west: 76.2,
  },
  dataQuality: {
    realtime: true,
    staticSchedule: true,
    indoorMaps: true,
    fareApi: true,
  },
  async getStations(): Promise<Station[]> {
    return kochiStations;
  },
  async getLines(): Promise<Line[]> {
    return kochiLines;
  },
  async getArrivals(stationId: string): Promise<Arrival[]> {
    return generateHeadwayArrivals(stationId, 'cok-cyan', [
      { dest: 'Thripunithura Terminal', platform: 'Platform 1' },
      { dest: 'Aluva', platform: 'Platform 2' },
    ], 6);
  },
  async getFare(fromId: string, toId: string, mode: string): Promise<Fare> {
    const s1 = kochiStations.find((s) => s.id === fromId) || kochiStations[0];
    const s2 = kochiStations.find((s) => s.id === toId) || kochiStations[1];
    const dist = calculateDistanceKm(s1.coordinates.lat, s1.coordinates.lng, s2.coordinates.lat, s2.coordinates.lng);
    let token = 10;
    if (dist > 18) token = 50;
    else if (dist > 10) token = 40;
    else if (dist > 5) token = 30;
    else if (dist > 2) token = 20;

    return {
      tokenFare: token,
      smartCardFare: Math.round(token * 0.9),
      durationMinutes: Math.max(5, Math.round(dist * 2.1)),
      distanceKm: dist,
      interchanges: 0,
    };
  },
  async getStationLayout(stationId: string): Promise<StationLayout | null> {
    const s = kochiStations.find((x) => x.id === stationId);
    return s ? createDefaultStationLayout(s) : null;
  },
  getTicketingGuide(): TicketingGuide {
    return {
      methods: [
        {
          id: 'kochi1-whatsapp',
          name: 'KMRL WhatsApp QR (+91 9188460160)',
          description: 'Official WhatsApp ticketing integrated with Kochi Water Metro.',
          icon: 'MessageSquare',
          supportedApps: ['WhatsApp', 'Kochi 1 App'],
        },
        {
          id: 'kochi1-card',
          name: 'Kochi 1 Axis Bank Smart Card',
          description: 'Integrated card for Kochi Metro, Water Metro ferries, and KSRTC buses.',
          icon: 'CreditCard',
          supportedApps: ['Axis Bank Kochi 1', 'NCMC RuPay'],
        },
      ],
      modes: ['qr', 'token', 'card'],
      tips: [
        'Single ticket can be used across Kochi Metro and Kochi Water Metro boat services.',
        'Direct covered skybridge from Edapally station leads directly into Lulu Mall 2nd floor.',
      ],
      rules: ['Maximum travel duration permitted is 120 minutes.'],
      mistakes: ['Do not confuse Rail Metro with Water Metro jetties—feeder buses connect them.'],
    };
  },
};
