/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MetroAdapter, Station, Line, Arrival, Fare, TicketingGuide, StationLayout } from '../types';
import { calculateDistanceKm, createDefaultStationLayout, generateHeadwayArrivals } from './helper';

export const kolkataStations: Station[] = [
  {
    id: 'ccu-howrah',
    name: 'Howrah Railway Station (Deepest in India)',
    nativeName: 'হাওড়া',
    cityId: 'kolkata',
    lines: ['ccu-green'],
    coordinates: { lat: 22.5833, lng: 88.3426 },
    isInterchange: true,
    facilities: ['India Deepest Metro Station (33m)', 'Direct Railway Platform Link', 'Lifts', 'Toilets'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'Howrah Railway Station Concourse / Cab Road', accessible: true },
      { gateNumber: 'Gate 2', streetName: 'Howrah Bus Terminus / Ferry Ghat', accessible: true },
    ],
    firstTrain: '07:00 AM',
    lastTrain: '09:45 PM',
    platformCount: 2,
    layoutType: 'underground',
    crowdLevel: 'HIGH',
  },
  {
    id: 'ccu-esplanade',
    name: 'Esplanade Interchange',
    nativeName: 'এসপ্ল্যানেড',
    cityId: 'kolkata',
    lines: ['ccu-blue', 'ccu-green'],
    coordinates: { lat: 22.5647, lng: 88.3518 },
    isInterchange: true,
    facilities: ['Interchange Concourse', 'Bus Terminus Access', 'Lifts', 'Customer Care'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'Curzon Park / Dufferin Road', accessible: true },
      { gateNumber: 'Gate 3', streetName: 'Jawaharlal Nehru Road / New Market', accessible: true },
    ],
    firstTrain: '06:45 AM',
    lastTrain: '10:00 PM',
    platformCount: 4,
    layoutType: 'underground',
    crowdLevel: 'HIGH',
  },
  {
    id: 'ccu-dumdum',
    name: 'Dum Dum Junction',
    nativeName: 'দমদম',
    cityId: 'kolkata',
    lines: ['ccu-blue'],
    coordinates: { lat: 22.6225, lng: 88.3941 },
    isInterchange: true,
    facilities: ['Eastern Railway Local Train Link', 'Lifts', 'Escalators', 'Auto Stand'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'Dum Dum Railway Station Platform 1 Direct', accessible: true },
    ],
    firstTrain: '06:50 AM',
    lastTrain: '09:50 PM',
    platformCount: 2,
    layoutType: 'elevated',
    crowdLevel: 'HIGH',
  },
  {
    id: 'ccu-salt-lake-sec-v',
    name: 'Salt Lake Sector V',
    nativeName: 'সল্টলেক সেক্টর ৫',
    cityId: 'kolkata',
    lines: ['ccu-green'],
    coordinates: { lat: 22.5802, lng: 88.4372 },
    isInterchange: false,
    facilities: ['IT Hub Connection', 'Feeder E-Rickshaws', 'Lifts', 'Toilets'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'Wipro Crossing / College More', accessible: true },
    ],
    firstTrain: '06:55 AM',
    lastTrain: '10:00 PM',
    platformCount: 2,
    layoutType: 'elevated',
    crowdLevel: 'MODERATE',
  },
];

export const kolkataLines: Line[] = [
  {
    id: 'ccu-blue',
    name: 'Line 1 (Blue Line / North-South)',
    nativeName: 'ব্লু লাইন (উত্তর-দক্ষিণ)',
    cityId: 'kolkata',
    color: '#1D4ED8',
    textColor: '#FFFFFF',
    isUnderground: true,
    coachCount: 8,
    stations: ['ccu-dumdum', 'ccu-esplanade'],
    operatorLivery: {
      primaryColor: '#1D4ED8',
      stripeColor: '#1E3A8A',
      bodyMaterial: 'white-aluminum',
      accentColor: '#93C5FD',
    },
  },
  {
    id: 'ccu-green',
    name: 'Line 2 (Green Line / Underwater East-West)',
    nativeName: 'গ্রিন লাইন (গঙ্গা নদীর নিচে)',
    cityId: 'kolkata',
    color: '#059669', // Emerald underwater green
    textColor: '#FFFFFF',
    isUnderground: true,
    coachCount: 6,
    stations: ['ccu-howrah', 'ccu-esplanade', 'ccu-salt-lake-sec-v'],
    operatorLivery: {
      primaryColor: '#059669',
      stripeColor: '#047857',
      bodyMaterial: 'stainless-steel',
      accentColor: '#A7F3D0',
    },
  },
];

export const KolkataAdapter: MetroAdapter = {
  cityId: 'kolkata',
  displayName: 'Kolkata Metro',
  nativeName: 'কলকাতা মেট্রো',
  operator: 'Metro Railway Kolkata (Indian Railways)',
  languageCode: 'bn',
  center: { lat: 22.5726, lng: 88.3639 },
  bounds: {
    north: 22.75,
    south: 22.4,
    east: 88.5,
    west: 88.25,
  },
  dataQuality: {
    realtime: true,
    staticSchedule: true,
    indoorMaps: true,
    fareApi: true,
  },
  async getStations(): Promise<Station[]> {
    return kolkataStations;
  },
  async getLines(): Promise<Line[]> {
    return kolkataLines;
  },
  async getArrivals(stationId: string): Promise<Arrival[]> {
    const station = kolkataStations.find((s) => s.id === stationId);
    if (!station) return [];
    const arrivals: Arrival[] = [];
    if (station.lines.includes('ccu-green')) {
      arrivals.push(
        ...generateHeadwayArrivals(stationId, 'ccu-green', [
          { dest: 'Howrah Maidan (via River)', platform: 'Platform 1' },
          { dest: 'Salt Lake Sector V', platform: 'Platform 2' },
        ], 6)
      );
    }
    if (station.lines.includes('ccu-blue')) {
      arrivals.push(
        ...generateHeadwayArrivals(stationId, 'ccu-blue', [
          { dest: 'Dakshineswar', platform: 'Platform 1' },
          { dest: 'Kavi Subhash', platform: 'Platform 2' },
        ], 5)
      );
    }
    return arrivals.sort((a, b) => a.etaSeconds - b.etaSeconds);
  },
  async getFare(fromId: string, toId: string, mode: string): Promise<Fare> {
    const s1 = kolkataStations.find((s) => s.id === fromId) || kolkataStations[0];
    const s2 = kolkataStations.find((s) => s.id === toId) || kolkataStations[1];
    const dist = calculateDistanceKm(s1.coordinates.lat, s1.coordinates.lng, s2.coordinates.lat, s2.coordinates.lng);
    let token = 5;
    if (dist > 20) token = 25;
    else if (dist > 10) token = 20;
    else if (dist > 5) token = 10;

    return {
      tokenFare: token,
      smartCardFare: token,
      durationMinutes: Math.max(4, Math.round(dist * 2.2)),
      distanceKm: dist,
      interchanges: s1.lines.some((l) => s2.lines.includes(l)) ? 0 : 1,
    };
  },
  async getStationLayout(stationId: string): Promise<StationLayout | null> {
    const s = kolkataStations.find((x) => x.id === stationId);
    return s ? createDefaultStationLayout(s) : null;
  },
  getTicketingGuide(): TicketingGuide {
    return {
      methods: [
        {
          id: 'metro-ride-kolkata-app',
          name: 'Metro Ride Kolkata App QR',
          description: 'Official app by CRIS/Indian Railways for QR ticketing.',
          icon: 'QrCode',
          supportedApps: ['Metro Ride Kolkata App', 'BookMyShow'],
        },
        {
          id: 'kolkata-smart-card',
          name: 'Metro Smart Card',
          description: 'Contactless smart card with 10% bonus travel value on recharges.',
          icon: 'CreditCard',
          supportedApps: ['Metro Booking Counters', 'SBI Unipay'],
        },
        {
          id: 'token-coin',
          name: 'Single Journey Token',
          description: 'Round plastic token, tap in and slot drop at exit gate.',
          icon: 'Coins',
          supportedApps: ['Counter', 'TVM'],
        },
      ],
      modes: ['qr', 'token', 'card'],
      tips: [
        'Howrah Metro Station is 33 meters underground—India’s deepest rail station.',
        'Underwater river section is illuminated with special blue lighting in the tunnel.',
      ],
      rules: [
        'Token valid only on the date of purchase.',
        'Overstay inside paid area beyond 120 minutes is subject to railway penalty.',
      ],
      mistakes: [
        'Tokens purchased on Blue Line are NOT interchangeable on Green Line without proper interchange exit.',
      ],
    };
  },
};
