/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MetroAdapter, Station, Line, Arrival, Fare, TicketingGuide, StationLayout } from '../types';
import { calculateDistanceKm, createDefaultStationLayout, generateHeadwayArrivals } from './helper';

export const delhiStations: Station[] = [
  {
    id: 'del-rajiv-chowk',
    name: 'Rajiv Chowk (Connaught Place)',
    nativeName: 'राजीव चौक',
    cityId: 'delhi',
    lines: ['del-yellow', 'del-blue'],
    coordinates: { lat: 28.6328, lng: 77.2195 },
    isInterchange: true,
    facilities: ['Lifts', 'Escalators', 'Toilets', 'First Aid', 'Customer Care', 'Food Court', 'ATM'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'Radial Road 1, Block B / Central Park', accessible: true },
      { gateNumber: 'Gate 2', streetName: 'PVR Plaza / Radial Road 2', accessible: true },
      { gateNumber: 'Gate 3', streetName: 'Janpath Road / Palika Bazaar', accessible: false },
      { gateNumber: 'Gate 7', streetName: 'Regal Cinema / Baba Kharak Singh Marg', accessible: true },
      { gateNumber: 'Gate 8', streetName: 'Radial Road 7 / Central Park Outer Circle', accessible: false },
    ],
    firstTrain: '05:45 AM',
    lastTrain: '11:30 PM',
    platformCount: 4,
    layoutType: 'underground',
    crowdLevel: 'HIGH',
  },
  {
    id: 'del-kashmere-gate',
    name: 'Kashmere Gate ISBT',
    nativeName: 'कश्मीरी गेट',
    cityId: 'delhi',
    lines: ['del-red', 'del-yellow', 'del-violet'],
    coordinates: { lat: 28.6675, lng: 77.2285 },
    isInterchange: true,
    facilities: ['Interstate Bus Terminal', 'Lifts', 'Escalators', 'Cloak Room', 'Toilets', 'Wheelchair Assistance'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'ISBT Main Arrival Hall', accessible: true },
      { gateNumber: 'Gate 2', streetName: 'Mori Gate / Hamilton Road', accessible: false },
      { gateNumber: 'Gate 4', streetName: 'Lothian Road / St. James Church', accessible: true },
    ],
    firstTrain: '05:30 AM',
    lastTrain: '11:45 PM',
    platformCount: 6,
    layoutType: 'underground',
    crowdLevel: 'HIGH',
  },
  {
    id: 'del-new-delhi',
    name: 'New Delhi Railway Station',
    nativeName: 'नई दिल्ली',
    cityId: 'delhi',
    lines: ['del-yellow', 'del-airport'],
    coordinates: { lat: 28.6431, lng: 77.2223 },
    isInterchange: true,
    facilities: ['Railway Station Direct Skywalk', 'Airport Check-in', 'Luggage Trolleys', 'Lifts', 'Escalators'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'Ajmeri Gate (Railway Station Side)', accessible: true },
      { gateNumber: 'Gate 2', streetName: 'Bhavbhuti Marg / Airport Express Terminal', accessible: true },
    ],
    firstTrain: '04:45 AM',
    lastTrain: '11:40 PM',
    platformCount: 4,
    layoutType: 'underground',
    crowdLevel: 'HIGH',
  },
  {
    id: 'del-chandni-chowk',
    name: 'Chandni Chowk',
    nativeName: 'चांदनी चौक',
    cityId: 'delhi',
    lines: ['del-yellow'],
    coordinates: { lat: 28.6578, lng: 77.2301 },
    isInterchange: false,
    facilities: ['Lifts', 'Escalators', 'Old Delhi Railway Station Skywalk', 'Toilets'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'Chandni Chowk Main Bazaar / Town Hall', accessible: false },
      { gateNumber: 'Gate 3', streetName: 'Old Delhi Railway Station Footover Bridge', accessible: true },
    ],
    firstTrain: '05:50 AM',
    lastTrain: '11:25 PM',
    platformCount: 2,
    layoutType: 'underground',
    crowdLevel: 'HIGH',
  },
  {
    id: 'del-huda-city-centre',
    name: 'Millennium City Centre Gurugram',
    nativeName: 'मिलेनियम सिटी सेंटर गुरुग्राम',
    cityId: 'delhi',
    lines: ['del-yellow'],
    coordinates: { lat: 28.4593, lng: 77.0725 },
    isInterchange: false,
    facilities: ['Parking', 'Auto Stand', 'Feeder Buses', 'Lifts', 'Shopping Arcade'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'Max Hospital / Fortis Hospital Side', accessible: true },
      { gateNumber: 'Gate 2', streetName: 'Signature Tower / Sushant Lok Road', accessible: true },
    ],
    firstTrain: '05:45 AM',
    lastTrain: '11:00 PM',
    platformCount: 2,
    layoutType: 'elevated',
    crowdLevel: 'MODERATE',
  },
  {
    id: 'del-central-secretariat',
    name: 'Central Secretariat',
    nativeName: 'केंद्रीय सचिवालय',
    cityId: 'delhi',
    lines: ['del-yellow', 'del-violet'],
    coordinates: { lat: 28.6147, lng: 77.2119 },
    isInterchange: true,
    facilities: ['Govt Offices Access', 'Lifts', 'Escalators', 'Security Escort', 'Toilets'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'Krishi Bhawan / Dr. Rajendra Prasad Road', accessible: true },
      { gateNumber: 'Gate 3', streetName: 'Shastri Bhawan / Rajpath Crossing', accessible: true },
    ],
    firstTrain: '05:55 AM',
    lastTrain: '11:35 PM',
    platformCount: 4,
    layoutType: 'underground',
    crowdLevel: 'MODERATE',
  },
  {
    id: 'del-igi-airport',
    name: 'IGI Airport Terminal 3',
    nativeName: 'आईजीआई एयरपोर्ट टी3',
    cityId: 'delhi',
    lines: ['del-airport'],
    coordinates: { lat: 28.5562, lng: 77.0863 },
    isInterchange: false,
    facilities: ['Flight Info Displays', 'Direct Terminal Air Bridge', 'Luggage Assistance', 'Accessible Lifts'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'Terminal 3 International / Domestic Arrivals & Departures', accessible: true },
    ],
    firstTrain: '04:45 AM',
    lastTrain: '11:55 PM',
    platformCount: 2,
    layoutType: 'underground',
    crowdLevel: 'LOW',
  },
  {
    id: 'del-noida-electronic-city',
    name: 'Noida Electronic City',
    nativeName: 'नोएडा इलेक्ट्रॉनिक सिटी',
    cityId: 'delhi',
    lines: ['del-blue'],
    coordinates: { lat: 28.6277, lng: 77.3739 },
    isInterchange: false,
    facilities: ['Parking', 'Lifts', 'Auto Stand', 'E-Rickshaw Feeder', 'Toilets'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'NH-24 Side / Shipra Mall Crossing', accessible: true },
      { gateNumber: 'Gate 2', streetName: 'Sector 62 IT Park Side', accessible: true },
    ],
    firstTrain: '05:45 AM',
    lastTrain: '11:00 PM',
    platformCount: 2,
    layoutType: 'elevated',
    crowdLevel: 'MODERATE',
  },
  {
    id: 'del-dwarka-sec-21',
    name: 'Dwarka Sector 21',
    nativeName: 'द्वारका सेक्टर 21',
    cityId: 'delhi',
    lines: ['del-blue', 'del-airport'],
    coordinates: { lat: 28.5522, lng: 77.0583 },
    isInterchange: true,
    facilities: ['Interchange Concourse', 'Multi-level Parking', 'Lifts', 'Toilets'],
    entrances: [
      { gateNumber: 'Gate 1', streetName: 'Main Sector 21 Complex Road', accessible: true },
    ],
    firstTrain: '05:30 AM',
    lastTrain: '11:15 PM',
    platformCount: 4,
    layoutType: 'underground',
    crowdLevel: 'MODERATE',
  },
];

export const delhiLines: Line[] = [
  {
    id: 'del-yellow',
    name: 'Yellow Line',
    nativeName: 'येलो लाइन',
    cityId: 'delhi',
    color: '#EAB308', // Amber/Yellow
    textColor: '#000000',
    isUnderground: true,
    coachCount: 8,
    stations: ['del-kashmere-gate', 'del-chandni-chowk', 'del-new-delhi', 'del-rajiv-chowk', 'del-central-secretariat', 'del-huda-city-centre'],
    operatorLivery: {
      primaryColor: '#EAB308',
      stripeColor: '#CA8A04',
      bodyMaterial: 'stainless-steel',
      accentColor: '#FEF08A',
    },
  },
  {
    id: 'del-blue',
    name: 'Blue Line',
    nativeName: 'ब्लू लाइन',
    cityId: 'delhi',
    color: '#2563EB', // Blue
    textColor: '#FFFFFF',
    isUnderground: false,
    coachCount: 8,
    stations: ['del-dwarka-sec-21', 'del-rajiv-chowk', 'del-noida-electronic-city'],
    operatorLivery: {
      primaryColor: '#2563EB',
      stripeColor: '#1D4ED8',
      bodyMaterial: 'stainless-steel',
      accentColor: '#93C5FD',
    },
  },
  {
    id: 'del-red',
    name: 'Red Line',
    nativeName: 'रेड लाइन',
    cityId: 'delhi',
    color: '#DC2626',
    textColor: '#FFFFFF',
    isUnderground: false,
    coachCount: 6,
    stations: ['del-kashmere-gate'],
    operatorLivery: {
      primaryColor: '#DC2626',
      stripeColor: '#991B1B',
      bodyMaterial: 'stainless-steel',
      accentColor: '#FCA5A5',
    },
  },
  {
    id: 'del-violet',
    name: 'Violet Line',
    nativeName: 'वायलेट लाइन',
    cityId: 'delhi',
    color: '#7C3AED',
    textColor: '#FFFFFF',
    isUnderground: true,
    coachCount: 6,
    stations: ['del-kashmere-gate', 'del-central-secretariat'],
    operatorLivery: {
      primaryColor: '#7C3AED',
      stripeColor: '#5B21B6',
      bodyMaterial: 'stainless-steel',
      accentColor: '#DDD6FE',
    },
  },
  {
    id: 'del-airport',
    name: 'Airport Express (Orange Line)',
    nativeName: 'एयरपोर्ट एक्सप्रेस',
    cityId: 'delhi',
    color: '#EA580C',
    textColor: '#FFFFFF',
    isUnderground: true,
    coachCount: 6,
    stations: ['del-new-delhi', 'del-igi-airport', 'del-dwarka-sec-21'],
    operatorLivery: {
      primaryColor: '#EA580C',
      stripeColor: '#C2410C',
      bodyMaterial: 'metallic-silver',
      accentColor: '#FDBA74',
    },
  },
];

export const DelhiAdapter: MetroAdapter = {
  cityId: 'delhi',
  displayName: 'Delhi NCR',
  nativeName: 'दिल्ली मेट्रो (DMRC)',
  operator: 'Delhi Metro Rail Corporation (DMRC)',
  languageCode: 'hi',
  center: { lat: 28.6139, lng: 77.209 },
  bounds: {
    north: 28.95,
    south: 28.3,
    east: 77.55,
    west: 76.85,
  },
  dataQuality: {
    realtime: true,
    staticSchedule: true,
    indoorMaps: true,
    fareApi: true,
  },
  async getStations(): Promise<Station[]> {
    return delhiStations;
  },
  async getLines(): Promise<Line[]> {
    return delhiLines;
  },
  async getArrivals(stationId: string): Promise<Arrival[]> {
    const station = delhiStations.find((s) => s.id === stationId);
    if (!station) return [];

    const arrivals: Arrival[] = [];
    if (station.lines.includes('del-yellow')) {
      arrivals.push(
        ...generateHeadwayArrivals(stationId, 'del-yellow', [
          { dest: 'Samaypur Badli', platform: 'Platform 1' },
          { dest: 'Millennium City Centre Gurugram', platform: 'Platform 2' },
        ], 3.5)
      );
    }
    if (station.lines.includes('del-blue')) {
      arrivals.push(
        ...generateHeadwayArrivals(stationId, 'del-blue', [
          { dest: 'Dwarka Sector 21', platform: 'Platform 3' },
          { dest: 'Noida Electronic City / Vaishali', platform: 'Platform 4' },
        ], 4)
      );
    }
    if (station.lines.includes('del-airport')) {
      arrivals.push(
        ...generateHeadwayArrivals(stationId, 'del-airport', [
          { dest: 'Yashobhoomi Dwarka Sector 25', platform: 'Platform 2' },
          { dest: 'New Delhi Railway Station', platform: 'Platform 1' },
        ], 10)
      );
    }
    return arrivals.sort((a, b) => a.etaSeconds - b.etaSeconds);
  },
  async getFare(fromId: string, toId: string, mode: string): Promise<Fare> {
    const s1 = delhiStations.find((s) => s.id === fromId) || delhiStations[0];
    const s2 = delhiStations.find((s) => s.id === toId) || delhiStations[1];
    const dist = calculateDistanceKm(s1.coordinates.lat, s1.coordinates.lng, s2.coordinates.lat, s2.coordinates.lng);
    
    // DMRC fare slabs: 0-2km: 10, 2-5km: 20, 5-12km: 30, 12-21km: 40, 21-32km: 50, >32km: 60
    let token = 10;
    if (dist > 32) token = 60;
    else if (dist > 21) token = 50;
    else if (dist > 12) token = 40;
    else if (dist > 5) token = 30;
    else if (dist > 2) token = 20;

    // Smart cards enjoy 10% discount, and 20% during off-peak hours
    const smartCard = Math.round(token * 0.9);
    const offPeak = Math.round(token * 0.8);
    const duration = Math.max(6, Math.round(dist * 2.1));
    const interchanges = s1.lines.some((l) => s2.lines.includes(l)) ? 0 : 1;

    return {
      tokenFare: token,
      smartCardFare: smartCard,
      offPeakFare: offPeak,
      durationMinutes: duration,
      distanceKm: dist,
      interchanges,
    };
  },
  async getStationLayout(stationId: string): Promise<StationLayout | null> {
    const s = delhiStations.find((x) => x.id === stationId);
    if (!s) return null;
    return createDefaultStationLayout(s);
  },
  getTicketingGuide(): TicketingGuide {
    return {
      methods: [
        {
          id: 'dmrc-qr',
          name: 'DMRC Saarthi / Momentum 2.0 QR',
          description: 'Official app QR ticket. Scan directly at green laser AFC gates.',
          icon: 'QrCode',
          supportedApps: ['DMRC Momentum 2.0', 'WhatsApp (9650855800)', 'Paytm', 'One Delhi'],
        },
        {
          id: 'ncmc-card',
          name: 'NCMC RuPay Smart Card / DMRC Card',
          description: 'Tap on circular sensor at entry and exit gates. Minimum balance ₹50 required.',
          icon: 'CreditCard',
          supportedApps: ['SBI NCMC', 'Airtel Payments Bank NCMC', 'Any RuPay Transit Card'],
        },
        {
          id: 'token-coin',
          name: 'Single Journey Token (Coin)',
          description: 'Purchase at TVM kiosk or counter. Tap at entry gate, DROP into slot at exit gate.',
          icon: 'Coins',
          supportedApps: ['Ticket Counter', 'Token Vending Machine (TVM)'],
        },
      ],
      modes: ['qr', 'token', 'card'],
      tips: [
        'Hold phone screen 5 cm above the glass reader with 100% brightness for fast QR reads.',
        'At Rajiv Chowk, Yellow Line is at Concourse -1 and Blue Line is at Platform -2.',
        'Women-only coach is the first coach of every train in moving direction.',
      ],
      rules: [
        'Time limit inside station: 180 minutes on same station exit: 20 minutes.',
        'Overstay penalty: ₹10 per extra hour up to maximum ₹50.',
      ],
      mistakes: [
        'Do NOT discard token coin after tapping in—you must drop it into the exit gate slot to open.',
        'Screenshots of QR tickets may fail if dynamic animated bar expires.',
      ],
    };
  },
};
