/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MetroAdapter, Station, Line, Arrival, Fare, TicketingGuide, StationLayout } from '../types';
import { calculateDistanceKm, createDefaultStationLayout, generateHeadwayArrivals } from './helper';

export const hyderabadStations: Station[] = [
  {
    id: 'hyd-ameerpet',
    name: 'Ameerpet Interchange',
    nativeName: 'అమీర్‌పేట్',
    cityId: 'hyderabad',
    lines: ['hyd-red', 'hyd-blue'],
    coordinates: { lat: 17.4375, lng: 78.4483 },
    isInterchange: true,
    facilities: ['Two-Level Elevated Cross Interchange', 'Lifts', 'Customer Care', 'ATM', 'Food Court'],
    entrances: [
      { gateNumber: 'Gate A', streetName: 'Greenlands / Begumpet Road', accessible: true },
      { gateNumber: 'Gate B', streetName: 'Mythrivanam IT Coaching Hub Side', accessible: true },
      { gateNumber: 'Gate C', streetName: 'SR Nagar Main Road', accessible: true },
    ],
    firstTrain: '06:00 AM',
    lastTrain: '11:00 PM',
    platformCount: 4,
    layoutType: 'elevated',
    crowdLevel: 'HIGH',
  },
  {
    id: 'hyd-raidurg',
    name: 'Raidurg (HITEC City Cyber Towers)',
    nativeName: 'రాయదుర్గం',
    cityId: 'hyderabad',
    lines: ['hyd-blue'],
    coordinates: { lat: 17.4428, lng: 78.3772 },
    isInterchange: false,
    facilities: ['Direct Skywalk to Mindspace IT Park', 'Feeder Electric Autos', 'Lifts', 'Toilets'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'Mindspace Madhapur Direct Skybridge', accessible: true },
      { gateNumber: 'Gate 2', streetName: 'Inorbit Mall Road / Biodiversity Junction', accessible: true },
    ],
    firstTrain: '06:00 AM',
    lastTrain: '11:15 PM',
    platformCount: 2,
    layoutType: 'elevated',
    crowdLevel: 'HIGH',
  },
  {
    id: 'hyd-mgbs',
    name: 'Mahatma Gandhi Bus Station (MGBS)',
    nativeName: 'ఎం.జి.బి.ఎస్ (ఇమ్లిబన్)',
    cityId: 'hyderabad',
    lines: ['hyd-red', 'hyd-green'],
    coordinates: { lat: 17.3789, lng: 78.4808 },
    isInterchange: true,
    facilities: ['Direct Bus Stand Passenger Footbridge', 'Cloakroom', 'Lifts', 'Toilets'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'MGBS Inter-State Bus Arrival Terminal', accessible: true },
      { gateNumber: 'Gate 2', streetName: 'Chaderghat / Old City Crossing', accessible: true },
    ],
    firstTrain: '06:00 AM',
    lastTrain: '11:00 PM',
    platformCount: 4,
    layoutType: 'elevated',
    crowdLevel: 'HIGH',
  },
  {
    id: 'hyd-secunderabad-west',
    name: 'Secunderabad West Railway Station',
    nativeName: 'సికింద్రాబాద్ వెస్ట్',
    cityId: 'hyderabad',
    lines: ['hyd-green'],
    coordinates: { lat: 17.4339, lng: 78.4983 },
    isInterchange: true,
    facilities: ['South Central Railway Junction Link', 'Auto Stand', 'Lifts', 'Luggage Check'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'Secunderabad Railway Station Concourse Link', accessible: true },
    ],
    firstTrain: '06:15 AM',
    lastTrain: '10:45 PM',
    platformCount: 2,
    layoutType: 'elevated',
    crowdLevel: 'HIGH',
  },
];

export const hyderabadLines: Line[] = [
  {
    id: 'hyd-red',
    name: 'Red Line (Corridor 1)',
    nativeName: 'రెడ్ లైన్',
    cityId: 'hyderabad',
    color: '#DC2626',
    textColor: '#FFFFFF',
    isUnderground: false,
    coachCount: 3,
    stations: ['hyd-ameerpet', 'hyd-mgbs'],
    operatorLivery: {
      primaryColor: '#DC2626',
      stripeColor: '#991B1B',
      bodyMaterial: 'stainless-steel',
      accentColor: '#FECACA',
    },
  },
  {
    id: 'hyd-blue',
    name: 'Blue Line (Corridor 3)',
    nativeName: 'బ్లూ లైన్',
    cityId: 'hyderabad',
    color: '#2563EB',
    textColor: '#FFFFFF',
    isUnderground: false,
    coachCount: 3,
    stations: ['hyd-raidurg', 'hyd-ameerpet'],
    operatorLivery: {
      primaryColor: '#2563EB',
      stripeColor: '#1D4ED8',
      bodyMaterial: 'stainless-steel',
      accentColor: '#BFDBFE',
    },
  },
  {
    id: 'hyd-green',
    name: 'Green Line (Corridor 2)',
    nativeName: 'గ్రీన్ లైన్',
    cityId: 'hyderabad',
    color: '#16A34A',
    textColor: '#FFFFFF',
    isUnderground: false,
    coachCount: 3,
    stations: ['hyd-secunderabad-west', 'hyd-mgbs'],
    operatorLivery: {
      primaryColor: '#16A34A',
      stripeColor: '#15803D',
      bodyMaterial: 'stainless-steel',
      accentColor: '#BBF7D0',
    },
  },
];

export const HyderabadAdapter: MetroAdapter = {
  cityId: 'hyderabad',
  displayName: 'Hyderabad Metro',
  nativeName: 'హైదరాబాద్ మెట్రో (HMRL / L&T)',
  operator: 'L&T Metro Rail (Hyderabad) Limited',
  languageCode: 'te',
  center: { lat: 17.385, lng: 78.4867 },
  bounds: {
    north: 17.6,
    south: 17.2,
    east: 78.65,
    west: 78.25,
  },
  dataQuality: {
    realtime: true,
    staticSchedule: true,
    indoorMaps: true,
    fareApi: true,
  },
  async getStations(): Promise<Station[]> {
    return hyderabadStations;
  },
  async getLines(): Promise<Line[]> {
    return hyderabadLines;
  },
  async getArrivals(stationId: string): Promise<Arrival[]> {
    const s = hyderabadStations.find((x) => x.id === stationId);
    if (!s) return [];
    return generateHeadwayArrivals(stationId, s.lines[0], [
      { dest: 'Raidurg (HITEC City)', platform: 'Platform 1' },
      { dest: 'Nagole', platform: 'Platform 2' },
    ], 4);
  },
  async getFare(fromId: string, toId: string, mode: string): Promise<Fare> {
    const s1 = hyderabadStations.find((s) => s.id === fromId) || hyderabadStations[0];
    const s2 = hyderabadStations.find((s) => s.id === toId) || hyderabadStations[1];
    const dist = calculateDistanceKm(s1.coordinates.lat, s1.coordinates.lng, s2.coordinates.lat, s2.coordinates.lng);
    let token = 10;
    if (dist > 22) token = 60;
    else if (dist > 14) token = 50;
    else if (dist > 8) token = 40;
    else if (dist > 4) token = 30;
    else if (dist > 2) token = 20;

    return {
      tokenFare: token,
      smartCardFare: Math.round(token * 0.9), // 10% discount on L&T smart cards
      durationMinutes: Math.max(5, Math.round(dist * 2.2)),
      distanceKm: dist,
      interchanges: s1.lines.some((l) => s2.lines.includes(l)) ? 0 : 1,
    };
  },
  async getStationLayout(stationId: string): Promise<StationLayout | null> {
    const s = hyderabadStations.find((x) => x.id === stationId);
    return s ? createDefaultStationLayout(s) : null;
  },
  getTicketingGuide(): TicketingGuide {
    return {
      methods: [
        {
          id: 'tsavaari-whatsapp',
          name: 'TSavaari / WhatsApp QR (+91 8341149494)',
          description: 'Official WhatsApp ticketing with instant QR barcode.',
          icon: 'MessageSquare',
          supportedApps: ['WhatsApp', 'Paytm', 'MakeMyTrip', 'PhonePe'],
        },
        {
          id: 'nebula-card',
          name: 'L&T Metro Smart Card / RuPay NCMC',
          description: 'Contactless smart card for regular commuters with auto-recharge.',
          icon: 'CreditCard',
          supportedApps: ['TSavaari', 'Any RuPay Transit'],
        },
        {
          id: 'token-coin',
          name: 'Single Journey Contactless Token',
          description: 'Round plastic token, tap in, drop in exit turnstile.',
          icon: 'Coins',
          supportedApps: ['Ticket Counter', 'TVM'],
        },
      ],
      modes: ['qr', 'token', 'card'],
      tips: [
        'Ameerpet is an engineering marvel with Red Line on Level 2 and Blue Line on Level 3.',
        'Direct covered foot-over-bridge into Mindspace tech park from Raidurg station.',
      ],
      rules: ['Maximum stay inside station premises is 120 minutes.'],
      mistakes: ['Ensure you go to the correct level at Ameerpet for your line direction.'],
    };
  },
};
