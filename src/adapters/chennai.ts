/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MetroAdapter, Station, Line, Arrival, Fare, TicketingGuide, StationLayout } from '../types';
import { calculateDistanceKm, createDefaultStationLayout, generateHeadwayArrivals } from './helper';

export const chennaiStations: Station[] = [
  {
    id: 'maa-central',
    name: 'Puratchi Thalaivar Dr. M.G. Ramachandran Central',
    nativeName: 'எம்.ஜி.ஆர் சென்ட்ரல்',
    cityId: 'chennai',
    lines: ['maa-blue', 'maa-green'],
    coordinates: { lat: 13.0827, lng: 80.2755 },
    isInterchange: true,
    facilities: ['Direct Chennai Central Railway Link', 'Underground Air-Conditioned Concourse', 'Lifts', 'Toilets'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'Poonamallee High Road / Central Railway Station', accessible: true },
      { gateNumber: 'Gate 2', streetName: 'Ripon Building / Victoria Public Hall', accessible: true },
    ],
    firstTrain: '05:00 AM',
    lastTrain: '11:00 PM',
    platformCount: 4,
    layoutType: 'underground',
    crowdLevel: 'HIGH',
  },
  {
    id: 'maa-airport',
    name: 'Chennai International Airport',
    nativeName: 'சென்னை விமான நிலையம்',
    cityId: 'chennai',
    lines: ['maa-blue'],
    coordinates: { lat: 12.9806, lng: 80.1633 },
    isInterchange: false,
    facilities: ['Direct Airport Terminal Air-Bridge', 'Luggage Check-in Facilitation', 'Lifts', 'Travelators'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'Domestic & International Terminal Connector', accessible: true },
      { gateNumber: 'Gate 2', streetName: 'GST Road Highway Pedestrian Footbridge', accessible: true },
    ],
    firstTrain: '05:00 AM',
    lastTrain: '11:00 PM',
    platformCount: 2,
    layoutType: 'elevated',
    crowdLevel: 'HIGH',
  },
  {
    id: 'maa-guindy',
    name: 'Guindy',
    nativeName: 'கிண்டி',
    cityId: 'chennai',
    lines: ['maa-blue'],
    coordinates: { lat: 13.0093, lng: 80.2132 },
    isInterchange: true,
    facilities: ['Guindy Railway Station Interchange', 'Bus Terminus Access', 'Lifts'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'GST Road / Race Course Road', accessible: true },
    ],
    firstTrain: '05:15 AM',
    lastTrain: '11:15 PM',
    platformCount: 2,
    layoutType: 'elevated',
    crowdLevel: 'MODERATE',
  },
];

export const chennaiLines: Line[] = [
  {
    id: 'maa-blue',
    name: 'Blue Line (Corridor 1)',
    nativeName: 'நீல வழித்தடம்',
    cityId: 'chennai',
    color: '#2563EB',
    textColor: '#FFFFFF',
    isUnderground: true,
    coachCount: 4,
    stations: ['maa-central', 'maa-guindy', 'maa-airport'],
    operatorLivery: {
      primaryColor: '#2563EB',
      stripeColor: '#10B981', // CMRL Blue with emerald green stripe
      bodyMaterial: 'stainless-steel',
      accentColor: '#93C5FD',
    },
  },
  {
    id: 'maa-green',
    name: 'Green Line (Corridor 2)',
    nativeName: 'பச்சை வழித்தடம்',
    cityId: 'chennai',
    color: '#059669',
    textColor: '#FFFFFF',
    isUnderground: true,
    coachCount: 4,
    stations: ['maa-central'],
    operatorLivery: {
      primaryColor: '#059669',
      stripeColor: '#047857',
      bodyMaterial: 'stainless-steel',
      accentColor: '#A7F3D0',
    },
  },
];

export const ChennaiAdapter: MetroAdapter = {
  cityId: 'chennai',
  displayName: 'Chennai Metro',
  nativeName: 'சென்னை மெட்ரோ (CMRL)',
  operator: 'Chennai Metro Rail Limited (CMRL)',
  languageCode: 'ta',
  center: { lat: 13.0827, lng: 80.2707 },
  bounds: {
    north: 13.25,
    south: 12.85,
    east: 80.35,
    west: 80.05,
  },
  dataQuality: {
    realtime: true,
    staticSchedule: true,
    indoorMaps: true,
    fareApi: true,
  },
  async getStations(): Promise<Station[]> {
    return chennaiStations;
  },
  async getLines(): Promise<Line[]> {
    return chennaiLines;
  },
  async getArrivals(stationId: string): Promise<Arrival[]> {
    const s = chennaiStations.find((x) => x.id === stationId);
    if (!s) return [];
    return generateHeadwayArrivals(stationId, 'maa-blue', [
      { dest: 'Chennai Airport', platform: 'Platform 1' },
      { dest: 'Wimco Nagar Depot', platform: 'Platform 2' },
    ], 5);
  },
  async getFare(fromId: string, toId: string, mode: string): Promise<Fare> {
    const s1 = chennaiStations.find((s) => s.id === fromId) || chennaiStations[0];
    const s2 = chennaiStations.find((s) => s.id === toId) || chennaiStations[1];
    const dist = calculateDistanceKm(s1.coordinates.lat, s1.coordinates.lng, s2.coordinates.lat, s2.coordinates.lng);
    let token = 10;
    if (dist > 21) token = 50;
    else if (dist > 12) token = 40;
    else if (dist > 6) token = 30;
    else if (dist > 2) token = 20;

    const smartCard = Math.round(token * 0.8); // 20% discount on CMRL smart cards and WhatsApp tickets
    return {
      tokenFare: token,
      smartCardFare: smartCard,
      durationMinutes: Math.max(5, Math.round(dist * 2.1)),
      distanceKm: dist,
      interchanges: 0,
    };
  },
  async getStationLayout(stationId: string): Promise<StationLayout | null> {
    const s = chennaiStations.find((x) => x.id === stationId);
    return s ? createDefaultStationLayout(s) : null;
  },
  getTicketingGuide(): TicketingGuide {
    return {
      methods: [
        {
          id: 'cmrl-whatsapp',
          name: 'CMRL WhatsApp Ticketing (+91 8300086000)',
          description: 'Instant 20% discount on WhatsApp and CMRL app QR tickets.',
          icon: 'MessageSquare',
          supportedApps: ['WhatsApp', 'CMRL Mobile App', 'Paytm'],
        },
        {
          id: 'singara-chennai-card',
          name: 'Singara Chennai NCMC Card',
          description: 'RuPay national common mobility card supported across Chennai.',
          icon: 'CreditCard',
          supportedApps: ['SBI Singara Chennai Card', 'RuPay NCMC'],
        },
        {
          id: 'token-coin',
          name: 'CMRL Token Coin',
          description: 'Single journey token bought at station counters.',
          icon: 'Coins',
          supportedApps: ['Station Counter', 'TVM'],
        },
      ],
      modes: ['qr', 'token', 'card'],
      tips: [
        'WhatsApp ticket gives a direct 20% discount over physical token counters.',
        'Direct travelator foot-over-bridge from Airport Metro station directly into Terminal 1 & 4 departures.',
      ],
      rules: [
        'Maximum journey time permitted inside metro system: 180 minutes.',
      ],
      mistakes: [
        'Do not bend or crush the physical QR paper receipt printed at counter kiosks.',
      ],
    };
  },
};
