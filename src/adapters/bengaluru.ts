/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MetroAdapter, Station, Line, Arrival, Fare, TicketingGuide, StationLayout } from '../types';
import { calculateDistanceKm, createDefaultStationLayout, generateHeadwayArrivals } from './helper';

export const bengaluruStations: Station[] = [
  {
    id: 'blr-majestic',
    name: 'Nadaprabhu Kempegowda Stn. (Majestic)',
    nativeName: 'ನಾಡಪ್ರಭು ಕೆಂಪೇಗೌಡ ನಿಲ್ದಾಣ ಮೆಜೆಸ್ಟಿಕ್',
    cityId: 'bengaluru',
    lines: ['blr-purple', 'blr-green'],
    coordinates: { lat: 12.9757, lng: 77.5728 },
    isInterchange: true,
    facilities: ['KSR Railway Station Skywalk', 'KSRTC / BMTC Bus Stands Direct Access', 'Lifts', 'Toilets', 'Food Stalls'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'BMTC City Bus Stand / Gubbi Thotadappa Road', accessible: true },
      { gateNumber: 'Gate 2', streetName: 'KSR Bengaluru City Railway Station Skybridge', accessible: true },
      { gateNumber: 'Gate 3', streetName: 'KSRTC Inter-City Terminal / Tank Bund Road', accessible: true },
    ],
    firstTrain: '05:00 AM',
    lastTrain: '11:00 PM',
    platformCount: 4,
    layoutType: 'underground',
    crowdLevel: 'HIGH',
  },
  {
    id: 'blr-mg-road',
    name: 'Mahatma Gandhi Road',
    nativeName: 'ಮಹಾತ್ಮಾ ಗಾಂಧಿ ರಸ್ತೆ',
    cityId: 'bengaluru',
    lines: ['blr-purple'],
    coordinates: { lat: 12.9756, lng: 77.6066 },
    isInterchange: false,
    facilities: ['Rangoli Metro Art Centre', 'Lifts', 'Escalators', 'Boulevard Walkway'],
    entrances: [
      { gateNumber: 'Gate A', streetName: 'MG Road Boulevard / Church Street', accessible: true },
      { gateNumber: 'Gate B', streetName: 'Brigade Road Junction / Barton Centre', accessible: true },
    ],
    firstTrain: '05:15 AM',
    lastTrain: '11:15 PM',
    platformCount: 2,
    layoutType: 'elevated',
    crowdLevel: 'HIGH',
  },
  {
    id: 'blr-indiranagar',
    name: 'Indiranagar (100 Feet Road)',
    nativeName: 'ಇಂದಿರಾನಗರ',
    cityId: 'bengaluru',
    lines: ['blr-purple'],
    coordinates: { lat: 12.9783, lng: 77.6386 },
    isInterchange: false,
    facilities: ['Lifts', 'Auto Stand', 'Pedestrian Walkway', 'Toilets'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'CMH Road / 100 Feet Road Junction', accessible: true },
      { gateNumber: 'Gate 2', streetName: 'Defence Colony / BDA Complex Side', accessible: true },
    ],
    firstTrain: '05:20 AM',
    lastTrain: '11:20 PM',
    platformCount: 2,
    layoutType: 'elevated',
    crowdLevel: 'MODERATE',
  },
  {
    id: 'blr-whitefield',
    name: 'Whitefield (Kadugodi)',
    nativeName: 'ವೈಟ್‌ಫೀಲ್ಡ್ (ಕಾಡುಗೋಡಿ)',
    cityId: 'bengaluru',
    lines: ['blr-purple'],
    coordinates: { lat: 12.9965, lng: 77.7612 },
    isInterchange: false,
    facilities: ['Whitefield Railway Station Link', 'Park and Ride', 'EV Charging', 'Feeder Buses'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'Kadugodi Bus Stand / Old Madras Road', accessible: true },
      { gateNumber: 'Gate 2', streetName: 'Whitefield Railway Station Approach', accessible: true },
    ],
    firstTrain: '05:00 AM',
    lastTrain: '11:00 PM',
    platformCount: 2,
    layoutType: 'elevated',
    crowdLevel: 'MODERATE',
  },
  {
    id: 'blr-yeshwanthpur',
    name: 'Yeshwanthpur',
    nativeName: 'ಯಶವಂತಪುರ',
    cityId: 'bengaluru',
    lines: ['blr-green'],
    coordinates: { lat: 13.0232, lng: 77.5501 },
    isInterchange: false,
    facilities: ['Direct FOB to Yeshwanthpur Railway Junction', 'Lifts', 'Escalators', 'Luggage Check'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'Tumkur Road / APMC Yard', accessible: true },
      { gateNumber: 'Gate 2', streetName: 'Railway Platform 6 Direct Skywalk', accessible: true },
    ],
    firstTrain: '05:05 AM',
    lastTrain: '11:10 PM',
    platformCount: 2,
    layoutType: 'elevated',
    crowdLevel: 'HIGH',
  },
  {
    id: 'blr-jayanagar',
    name: 'Jayanagar (4th Block)',
    nativeName: 'ಜಯನಗರ',
    cityId: 'bengaluru',
    lines: ['blr-green'],
    coordinates: { lat: 12.9295, lng: 77.5802 },
    isInterchange: false,
    facilities: ['BDA Shopping Complex Walkway', 'Lifts', 'Auto Stand', 'Toilets'],
    entrances: [
      { gateNumber: 'Gate A', streetName: 'Jayanagar 4th Block Shopping Complex', accessible: true },
      { gateNumber: 'Gate B', streetName: 'Rashtreeya Vidyalaya Road', accessible: true },
    ],
    firstTrain: '05:10 AM',
    lastTrain: '11:20 PM',
    platformCount: 2,
    layoutType: 'elevated',
    crowdLevel: 'MODERATE',
  },
  {
    id: 'blr-silk-board',
    name: 'Central Silk Board',
    nativeName: 'ಸೆಂಟ್ರಲ್ ಸಿಲ್ಕ್ ಬೋರ್ಡ್',
    cityId: 'bengaluru',
    lines: ['blr-yellow'],
    coordinates: { lat: 12.9174, lng: 77.6231 },
    isInterchange: false,
    facilities: ['Electronic City Flyover Walkway', 'Feeder Buses', 'Lifts'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'Hosur Road / Outer Ring Road Crossing', accessible: true },
    ],
    firstTrain: '05:30 AM',
    lastTrain: '10:45 PM',
    platformCount: 2,
    layoutType: 'elevated',
    crowdLevel: 'HIGH',
  },
];

export const bengaluruLines: Line[] = [
  {
    id: 'blr-purple',
    name: 'Purple Line',
    nativeName: 'ಪರ್ಪಲ್ ಲೈನ್ (ನೇರಳೆ)',
    cityId: 'bengaluru',
    color: '#7E22CE', // Royal Purple
    textColor: '#FFFFFF',
    isUnderground: true,
    coachCount: 6,
    stations: ['blr-majestic', 'blr-mg-road', 'blr-indiranagar', 'blr-whitefield'],
    operatorLivery: {
      primaryColor: '#7E22CE',
      stripeColor: '#6B21A8',
      bodyMaterial: 'stainless-steel',
      accentColor: '#D8B4FE',
    },
  },
  {
    id: 'blr-green',
    name: 'Green Line',
    nativeName: 'ಗ್ರೀನ್ ಲೈನ್ (ಹಸಿರು)',
    cityId: 'bengaluru',
    color: '#15803D', // Emerald Green
    textColor: '#FFFFFF',
    isUnderground: false,
    coachCount: 6,
    stations: ['blr-yeshwanthpur', 'blr-majestic', 'blr-jayanagar'],
    operatorLivery: {
      primaryColor: '#15803D',
      stripeColor: '#166534',
      bodyMaterial: 'stainless-steel',
      accentColor: '#86EFAC',
    },
  },
  {
    id: 'blr-yellow',
    name: 'Yellow Line (Driverless CBTC)',
    nativeName: 'ಯೆಲ್ಲೋ ಲೈನ್',
    cityId: 'bengaluru',
    color: '#EAB308',
    textColor: '#000000',
    isUnderground: false,
    coachCount: 6,
    stations: ['blr-silk-board'],
    operatorLivery: {
      primaryColor: '#EAB308',
      stripeColor: '#CA8A04',
      bodyMaterial: 'stainless-steel',
      accentColor: '#FEF08A',
    },
  },
];

export const BengaluruAdapter: MetroAdapter = {
  cityId: 'bengaluru',
  displayName: 'Bengaluru (Namma Metro)',
  nativeName: 'ನಮ್ಮ ಮೆಟ್ರೋ (BMRCL)',
  operator: 'Bangalore Metro Rail Corporation Ltd (BMRCL)',
  languageCode: 'kn',
  center: { lat: 12.9716, lng: 77.5946 },
  bounds: {
    north: 13.2,
    south: 12.75,
    east: 77.85,
    west: 77.4,
  },
  dataQuality: {
    realtime: true,
    staticSchedule: true,
    indoorMaps: true,
    fareApi: true,
  },
  async getStations(): Promise<Station[]> {
    return bengaluruStations;
  },
  async getLines(): Promise<Line[]> {
    return bengaluruLines;
  },
  async getArrivals(stationId: string): Promise<Arrival[]> {
    const station = bengaluruStations.find((s) => s.id === stationId);
    if (!station) return [];

    const arrivals: Arrival[] = [];
    if (station.lines.includes('blr-purple')) {
      arrivals.push(
        ...generateHeadwayArrivals(stationId, 'blr-purple', [
          { dest: 'Whitefield (Kadugodi)', platform: 'Platform 1' },
          { dest: 'Challaghatta', platform: 'Platform 2' },
        ], 4.5)
      );
    }
    if (station.lines.includes('blr-green')) {
      arrivals.push(
        ...generateHeadwayArrivals(stationId, 'blr-green', [
          { dest: 'Madavara (BIEC)', platform: 'Platform 3' },
          { dest: 'Silk Institute', platform: 'Platform 4' },
        ], 5)
      );
    }
    return arrivals.sort((a, b) => a.etaSeconds - b.etaSeconds);
  },
  async getFare(fromId: string, toId: string, mode: string): Promise<Fare> {
    const s1 = bengaluruStations.find((s) => s.id === fromId) || bengaluruStations[0];
    const s2 = bengaluruStations.find((s) => s.id === toId) || bengaluruStations[1];
    const dist = calculateDistanceKm(s1.coordinates.lat, s1.coordinates.lng, s2.coordinates.lat, s2.coordinates.lng);

    // BMRCL fare slabs
    let token = 10;
    if (dist > 25) token = 60;
    else if (dist > 18) token = 50;
    else if (dist > 12) token = 40;
    else if (dist > 6) token = 30;
    else if (dist > 2) token = 20;

    const smartCard = Math.round(token * 0.95); // 5% discount on Namma Metro QR & smart cards
    const duration = Math.max(5, Math.round(dist * 2.2));
    const interchanges = s1.lines.some((l) => s2.lines.includes(l)) ? 0 : 1;

    return {
      tokenFare: token,
      smartCardFare: smartCard,
      offPeakFare: smartCard,
      durationMinutes: duration,
      distanceKm: dist,
      interchanges,
    };
  },
  async getStationLayout(stationId: string): Promise<StationLayout | null> {
    const s = bengaluruStations.find((x) => x.id === stationId);
    if (!s) return null;
    return createDefaultStationLayout(s);
  },
  getTicketingGuide(): TicketingGuide {
    return {
      methods: [
        {
          id: 'namma-whatsapp',
          name: 'Namma Metro WhatsApp QR Ticket',
          description: 'Official WhatsApp ticketing (+91 8105556677). 5% instant discount.',
          icon: 'MessageSquare',
          supportedApps: ['WhatsApp', 'Namma Metro Official App', 'Paytm', 'Yatri'],
        },
        {
          id: 'ncmc-card',
          name: 'Namma Metro Smart Card / RuPay NCMC',
          description: 'Tap & go at gates. Rechargable via UPI or counter. Minimum balance ₹50.',
          icon: 'CreditCard',
          supportedApps: ['Namma Metro Smart Card', 'Any Bank NCMC RuPay'],
        },
        {
          id: 'token-coin',
          name: 'Contactless Token Coin',
          description: 'Single journey token bought at station counters. Tap entry, drop at exit.',
          icon: 'Coins',
          supportedApps: ['Station Counter', 'Token Vending Machine'],
        },
      ],
      modes: ['qr', 'token', 'card'],
      tips: [
        'At Majestic station, Purple Line trains run at Upper Platform and Green Line at Lower Platform.',
        'WhatsApp tickets can be generated in English or Kannada.',
        'Always hold the QR flat 10-15 cm from the optical reader.',
      ],
      rules: [
        'Stay inside the paid area is limited to 120 minutes (2 hours).',
        'Penalty for traveling beyond destination station without ticket upgrade: ₹250.',
      ],
      mistakes: [
        'Do not place the token directly on the QR scanner—tokens use the circular RFID antenna.',
      ],
    };
  },
};
