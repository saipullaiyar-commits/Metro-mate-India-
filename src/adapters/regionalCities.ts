/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MetroAdapter, Station, Line, Arrival, Fare, TicketingGuide, StationLayout } from '../types';
import { calculateDistanceKm, createDefaultStationLayout, generateHeadwayArrivals } from './helper';

interface RegionalMetroDef {
  cityId: string;
  displayName: string;
  nativeName: string;
  operator: string;
  languageCode: string;
  center: { lat: number; lng: number };
  bounds: { north: number; south: number; east: number; west: number };
  stations: Station[];
  lines: Line[];
  headwayMinutes: number;
}

const regionalDefs: RegionalMetroDef[] = [
  // Pune Metro
  {
    cityId: 'pune',
    displayName: 'Pune Metro',
    nativeName: 'पुणे मेट्रो (Maha Metro)',
    operator: 'Maharashtra Metro Rail Corporation (Maha Metro)',
    languageCode: 'mr',
    center: { lat: 18.5204, lng: 73.8567 },
    bounds: { north: 18.7, south: 18.4, east: 74.0, west: 73.7 },
    headwayMinutes: 7,
    stations: [
      {
        id: 'pun-civil-court',
        name: 'District Court (Civil Court Interchange)',
        nativeName: 'दिवाणी न्यायालय',
        cityId: 'pune',
        lines: ['pun-purple', 'pun-aqua'],
        coordinates: { lat: 18.5298, lng: 73.8546 },
        isInterchange: true,
        facilities: ['Underground & Elevated Cross Interchange', 'Lifts', 'Toilets'],
        entrances: [{ gateNumber: 'Gate 1', streetName: 'Shivajinagar Road', accessible: true }],
        firstTrain: '06:00 AM',
        lastTrain: '10:00 PM',
        platformCount: 4,
        layoutType: 'underground',
        crowdLevel: 'HIGH',
      },
      {
        id: 'pun-swargate',
        name: 'Swargate Terminal',
        nativeName: 'स्वारगेट',
        cityId: 'pune',
        lines: ['pun-purple'],
        coordinates: { lat: 18.5018, lng: 73.8586 },
        isInterchange: false,
        facilities: ['MSRTC Inter-City Bus Stand Link', 'Lifts'],
        entrances: [{ gateNumber: 'Gate 1', streetName: 'Swargate Bus Station', accessible: true }],
        firstTrain: '06:00 AM',
        lastTrain: '10:00 PM',
        platformCount: 2,
        layoutType: 'underground',
        crowdLevel: 'HIGH',
      },
    ],
    lines: [
      {
        id: 'pun-purple',
        name: 'Purple Line (PCMC - Swargate)',
        nativeName: 'जांभळी मार्गिका',
        cityId: 'pune',
        color: '#7C3AED',
        textColor: '#FFFFFF',
        isUnderground: true,
        coachCount: 3,
        stations: ['pun-civil-court', 'pun-swargate'],
        operatorLivery: {
          primaryColor: '#7C3AED',
          stripeColor: '#5B21B6',
          bodyMaterial: 'stainless-steel',
          accentColor: '#DDD6FE',
        },
      },
      {
        id: 'pun-aqua',
        name: 'Aqua Line (Vanaz - Ramwadi)',
        nativeName: 'अ‍ॅक्वा मार्गिका',
        cityId: 'pune',
        color: '#0D9488',
        textColor: '#FFFFFF',
        isUnderground: false,
        coachCount: 3,
        stations: ['pun-civil-court'],
        operatorLivery: {
          primaryColor: '#0D9488',
          stripeColor: '#0F766E',
          bodyMaterial: 'stainless-steel',
          accentColor: '#99F6E4',
        },
      },
    ],
  },
  // Nagpur Metro
  {
    cityId: 'nagpur',
    displayName: 'Nagpur Metro (Majhi Metro)',
    nativeName: 'माझी मेट्रो नागपूर',
    operator: 'Maha Metro Nagpur',
    languageCode: 'mr',
    center: { lat: 21.1458, lng: 79.0882 },
    bounds: { north: 21.3, south: 21.0, east: 79.25, west: 78.9 },
    headwayMinutes: 8,
    stations: [
      {
        id: 'nag-sitabuldi',
        name: 'Sitabuldi Interchange',
        nativeName: 'सीताबर्डी',
        cityId: 'nagpur',
        lines: ['nag-orange', 'nag-aqua'],
        coordinates: { lat: 21.1448, lng: 79.0837 },
        isInterchange: true,
        facilities: ['T-Shaped Interchange', 'Shopping Concourse', 'Lifts'],
        entrances: [{ gateNumber: 'Gate 1', streetName: 'Munje Square', accessible: true }],
        firstTrain: '06:30 AM',
        lastTrain: '10:00 PM',
        platformCount: 4,
        layoutType: 'elevated',
        crowdLevel: 'MODERATE',
      },
    ],
    lines: [
      {
        id: 'nag-orange',
        name: 'Orange Line',
        nativeName: 'ऑरेंज मार्गिका',
        cityId: 'nagpur',
        color: '#EA580C',
        textColor: '#FFFFFF',
        isUnderground: false,
        coachCount: 3,
        stations: ['nag-sitabuldi'],
        operatorLivery: {
          primaryColor: '#EA580C',
          stripeColor: '#C2410C',
          bodyMaterial: 'white-aluminum',
          accentColor: '#FDBA74',
        },
      },
    ],
  },
  // Lucknow Metro
  {
    cityId: 'lucknow',
    displayName: 'Lucknow Metro',
    nativeName: 'लखनऊ मेट्रो (UPMRC)',
    operator: 'Uttar Pradesh Metro Rail Corporation',
    languageCode: 'hi',
    center: { lat: 26.8467, lng: 80.9462 },
    bounds: { north: 27.0, south: 26.7, east: 81.1, west: 80.8 },
    headwayMinutes: 6,
    stations: [
      {
        id: 'lko-charbagh',
        name: 'Charbagh Railway Station',
        nativeName: 'चारबाग',
        cityId: 'lucknow',
        lines: ['lko-red'],
        coordinates: { lat: 26.8322, lng: 80.9198 },
        isInterchange: true,
        facilities: ['Direct Indian Railway Link', 'Lifts', 'Toilets'],
        entrances: [{ gateNumber: 'Gate 1', streetName: 'Charbagh Station Circle', accessible: true }],
        firstTrain: '06:00 AM',
        lastTrain: '10:00 PM',
        platformCount: 2,
        layoutType: 'elevated',
        crowdLevel: 'HIGH',
      },
      {
        id: 'lko-ccsi-airport',
        name: 'Chaudhary Charan Singh Airport',
        nativeName: 'चौधरी चरण सिंह हवाई अड्डा',
        cityId: 'lucknow',
        lines: ['lko-red'],
        coordinates: { lat: 26.7648, lng: 80.8841 },
        isInterchange: false,
        facilities: ['Underground Terminal', 'Direct Airport Access', 'Lifts'],
        entrances: [{ gateNumber: 'Gate 1', streetName: 'Airport Terminal 2 Concourse', accessible: true }],
        firstTrain: '06:00 AM',
        lastTrain: '10:00 PM',
        platformCount: 2,
        layoutType: 'underground',
        crowdLevel: 'MODERATE',
      },
    ],
    lines: [
      {
        id: 'lko-red',
        name: 'Red Line (North-South)',
        nativeName: 'रेड लाइन',
        cityId: 'lucknow',
        color: '#DC2626',
        textColor: '#FFFFFF',
        isUnderground: false,
        coachCount: 4,
        stations: ['lko-charbagh', 'lko-ccsi-airport'],
        operatorLivery: {
          primaryColor: '#DC2626',
          stripeColor: '#991B1B',
          bodyMaterial: 'stainless-steel',
          accentColor: '#FECACA',
        },
      },
    ],
  },
  // Ahmedabad Metro
  {
    cityId: 'ahmedabad',
    displayName: 'Ahmedabad Metro',
    nativeName: 'અમદાવાદ મેટ્રો (GMRC)',
    operator: 'Gujarat Metro Rail Corporation',
    languageCode: 'gu',
    center: { lat: 23.0225, lng: 72.5714 },
    bounds: { north: 23.2, south: 22.9, east: 72.7, west: 72.4 },
    headwayMinutes: 7,
    stations: [
      {
        id: 'adi-old-high-court',
        name: 'Old High Court Interchange',
        nativeName: 'જૂની હાઇકોર્ટ',
        cityId: 'ahmedabad',
        lines: ['adi-blue', 'adi-red'],
        coordinates: { lat: 23.0396, lng: 72.5694 },
        isInterchange: true,
        facilities: ['Cross-Line Skywalk', 'Lifts', 'Toilets'],
        entrances: [{ gateNumber: 'Gate 1', streetName: 'Ashram Road', accessible: true }],
        firstTrain: '06:30 AM',
        lastTrain: '10:00 PM',
        platformCount: 4,
        layoutType: 'elevated',
        crowdLevel: 'HIGH',
      },
      {
        id: 'adi-kalupur',
        name: 'Ahmedabad Railway Station (Kalupur)',
        nativeName: 'અમદાવાદ રેલવે સ્ટેશન (કાલુપુર)',
        cityId: 'ahmedabad',
        lines: ['adi-blue'],
        coordinates: { lat: 23.0242, lng: 72.6008 },
        isInterchange: true,
        facilities: ['Direct Bullet Train & Railway Link', 'Underground Concourse'],
        entrances: [{ gateNumber: 'Gate 1', streetName: 'Kalupur Circle', accessible: true }],
        firstTrain: '06:30 AM',
        lastTrain: '10:00 PM',
        platformCount: 2,
        layoutType: 'underground',
        crowdLevel: 'HIGH',
      },
    ],
    lines: [
      {
        id: 'adi-blue',
        name: 'East-West Corridor (Blue Line)',
        nativeName: 'પૂર્વ-પશ્ચિમ કોરિડોર',
        cityId: 'ahmedabad',
        color: '#2563EB',
        textColor: '#FFFFFF',
        isUnderground: false,
        coachCount: 3,
        stations: ['adi-old-high-court', 'adi-kalupur'],
        operatorLivery: {
          primaryColor: '#2563EB',
          stripeColor: '#1D4ED8',
          bodyMaterial: 'stainless-steel',
          accentColor: '#BFDBFE',
        },
      },
    ],
  },
  // Jaipur Metro
  {
    cityId: 'jaipur',
    displayName: 'Jaipur Metro',
    nativeName: 'जयपुर मेट्रो (JMRC)',
    operator: 'Jaipur Metro Rail Corporation',
    languageCode: 'hi',
    center: { lat: 26.9124, lng: 75.7873 },
    bounds: { north: 27.05, south: 26.8, east: 75.9, west: 75.65 },
    headwayMinutes: 8,
    stations: [
      {
        id: 'jai-badi-chaupar',
        name: 'Badi Chaupar (Walled City Heritage)',
        nativeName: 'बड़ी चौपड़',
        cityId: 'jaipur',
        lines: ['jai-pink'],
        coordinates: { lat: 26.9248, lng: 75.8306 },
        isInterchange: false,
        facilities: ['Heritage Wall Art', 'Hawa Mahal Walkway', 'Lifts'],
        entrances: [{ gateNumber: 'Gate 1', streetName: 'Hawa Mahal Road', accessible: true }],
        firstTrain: '06:20 AM',
        lastTrain: '09:45 PM',
        platformCount: 2,
        layoutType: 'underground',
        crowdLevel: 'HIGH',
      },
    ],
    lines: [
      {
        id: 'jai-pink',
        name: 'Pink Line',
        nativeName: 'पिंक लाइन',
        cityId: 'jaipur',
        color: '#EC4899',
        textColor: '#FFFFFF',
        isUnderground: true,
        coachCount: 4,
        stations: ['jai-badi-chaupar'],
        operatorLivery: {
          primaryColor: '#EC4899',
          stripeColor: '#DB2777',
          bodyMaterial: 'stainless-steel',
          accentColor: '#FBCFE8',
        },
      },
    ],
  },
  // Kanpur Metro
  {
    cityId: 'kanpur',
    displayName: 'Kanpur Metro',
    nativeName: 'कानपुर मेट्रो (UPMRC)',
    operator: 'Uttar Pradesh Metro Rail Corporation',
    languageCode: 'hi',
    center: { lat: 26.4499, lng: 80.3319 },
    bounds: { north: 26.6, south: 26.3, east: 80.45, west: 80.15 },
    headwayMinutes: 7,
    stations: [
      {
        id: 'kan-iit',
        name: 'IIT Kanpur',
        nativeName: 'आईआईटी कानपुर',
        cityId: 'kanpur',
        lines: ['kan-orange'],
        coordinates: { lat: 26.5123, lng: 80.2329 },
        isInterchange: false,
        facilities: ['IIT Gate Link', 'Lifts', 'Toilets'],
        entrances: [{ gateNumber: 'Gate 1', streetName: 'Grand Trunk Road', accessible: true }],
        firstTrain: '06:00 AM',
        lastTrain: '10:00 PM',
        platformCount: 2,
        layoutType: 'elevated',
        crowdLevel: 'MODERATE',
      },
    ],
    lines: [
      {
        id: 'kan-orange',
        name: 'Orange Line',
        nativeName: 'ऑरेंज लाइन',
        cityId: 'kanpur',
        color: '#EA580C',
        textColor: '#FFFFFF',
        isUnderground: false,
        coachCount: 3,
        stations: ['kan-iit'],
        operatorLivery: {
          primaryColor: '#EA580C',
          stripeColor: '#C2410C',
          bodyMaterial: 'stainless-steel',
          accentColor: '#FED7AA',
        },
      },
    ],
  },
  // Agra Metro
  {
    cityId: 'agra',
    displayName: 'Agra Metro',
    nativeName: 'आगरा मेट्रो (UPMRC)',
    operator: 'Uttar Pradesh Metro Rail Corporation',
    languageCode: 'hi',
    center: { lat: 27.1767, lng: 78.0081 },
    bounds: { north: 27.25, south: 27.1, east: 78.15, west: 77.9 },
    headwayMinutes: 8,
    stations: [
      {
        id: 'agr-taj-east-gate',
        name: 'Taj East Gate (Taj Mahal)',
        nativeName: 'ताज ईस्ट गेट',
        cityId: 'agra',
        lines: ['agr-yellow'],
        coordinates: { lat: 27.1687, lng: 78.0543 },
        isInterchange: false,
        facilities: ['Electric Cart Shuttle to Taj Mahal', 'Tourist Lounge', 'Lifts'],
        entrances: [{ gateNumber: 'Gate 1', streetName: 'Taj East Gate Approach', accessible: true }],
        firstTrain: '06:00 AM',
        lastTrain: '10:00 PM',
        platformCount: 2,
        layoutType: 'elevated',
        crowdLevel: 'HIGH',
      },
    ],
    lines: [
      {
        id: 'agr-yellow',
        name: 'Yellow Line (Priority Corridor)',
        nativeName: 'येलो लाइन',
        cityId: 'agra',
        color: '#EAB308',
        textColor: '#000000',
        isUnderground: false,
        coachCount: 3,
        stations: ['agr-taj-east-gate'],
        operatorLivery: {
          primaryColor: '#EAB308',
          stripeColor: '#CA8A04',
          bodyMaterial: 'stainless-steel',
          accentColor: '#FEF08A',
        },
      },
    ],
  },
  // Bhopal Metro
  {
    cityId: 'bhopal',
    displayName: 'Bhopal Metro (Bhoj Metro)',
    nativeName: 'भोपाल मेट्रो',
    operator: 'Madhya Pradesh Metro Rail Co Ltd (MPMRCL)',
    languageCode: 'hi',
    center: { lat: 23.2599, lng: 77.4126 },
    bounds: { north: 23.35, south: 23.15, east: 77.55, west: 77.3 },
    headwayMinutes: 8,
    stations: [
      {
        id: 'bho-subhash-nagar',
        name: 'Subhash Nagar Depot Station',
        nativeName: 'सुभाष नगर',
        cityId: 'bhopal',
        lines: ['bho-orange'],
        coordinates: { lat: 23.2422, lng: 77.4338 },
        isInterchange: false,
        facilities: ['Depot Interchange', 'Lifts', 'Toilets'],
        entrances: [{ gateNumber: 'Gate 1', streetName: 'Subhash Nagar Railway Overbridge', accessible: true }],
        firstTrain: '06:30 AM',
        lastTrain: '09:30 PM',
        platformCount: 2,
        layoutType: 'elevated',
        crowdLevel: 'MODERATE',
      },
    ],
    lines: [
      {
        id: 'bho-orange',
        name: 'Orange Line',
        nativeName: 'ऑरेंज लाइन',
        cityId: 'bhopal',
        color: '#EA580C',
        textColor: '#FFFFFF',
        isUnderground: false,
        coachCount: 3,
        stations: ['bho-subhash-nagar'],
        operatorLivery: {
          primaryColor: '#EA580C',
          stripeColor: '#C2410C',
          bodyMaterial: 'stainless-steel',
          accentColor: '#FED7AA',
        },
      },
    ],
  },
  // Indore Metro
  {
    cityId: 'indore',
    displayName: 'Indore Metro',
    nativeName: 'इंदौर मेट्रो',
    operator: 'Madhya Pradesh Metro Rail Co Ltd (MPMRCL)',
    languageCode: 'hi',
    center: { lat: 22.7196, lng: 75.8577 },
    bounds: { north: 22.85, south: 22.6, east: 75.98, west: 75.75 },
    headwayMinutes: 8,
    stations: [
      {
        id: 'ind-gandhi-nagar',
        name: 'Gandhi Nagar (Super Corridor)',
        nativeName: 'गांधी नगर',
        cityId: 'indore',
        lines: ['ind-yellow'],
        coordinates: { lat: 22.7571, lng: 75.8028 },
        isInterchange: false,
        facilities: ['Airport Road Approach', 'Lifts', 'Toilets'],
        entrances: [{ gateNumber: 'Gate 1', streetName: 'Super Corridor Main Road', accessible: true }],
        firstTrain: '06:30 AM',
        lastTrain: '09:30 PM',
        platformCount: 2,
        layoutType: 'elevated',
        crowdLevel: 'MODERATE',
      },
    ],
    lines: [
      {
        id: 'ind-yellow',
        name: 'Yellow Line (Ring Line)',
        nativeName: 'येलो लाइन',
        cityId: 'indore',
        color: '#EAB308',
        textColor: '#000000',
        isUnderground: false,
        coachCount: 3,
        stations: ['ind-gandhi-nagar'],
        operatorLivery: {
          primaryColor: '#EAB308',
          stripeColor: '#CA8A04',
          bodyMaterial: 'stainless-steel',
          accentColor: '#FEF08A',
        },
      },
    ],
  },
];

export function buildRegionalAdapter(def: RegionalMetroDef): MetroAdapter {
  return {
    cityId: def.cityId,
    displayName: def.displayName,
    nativeName: def.nativeName,
    operator: def.operator,
    languageCode: def.languageCode,
    center: def.center,
    bounds: def.bounds,
    dataQuality: {
      realtime: true,
      staticSchedule: true,
      indoorMaps: true,
      fareApi: true,
    },
    async getStations(): Promise<Station[]> {
      return def.stations;
    },
    async getLines(): Promise<Line[]> {
      return def.lines;
    },
    async getArrivals(stationId: string): Promise<Arrival[]> {
      const s = def.stations.find((x) => x.id === stationId);
      if (!s || s.lines.length === 0) return [];
      return generateHeadwayArrivals(stationId, s.lines[0], [
        { dest: `${def.displayName} Terminal`, platform: 'Platform 1' },
      ], def.headwayMinutes);
    },
    async getFare(fromId: string, toId: string): Promise<Fare> {
      const s1 = def.stations.find((s) => s.id === fromId) || def.stations[0];
      const s2 = def.stations.find((s) => s.id === toId) || def.stations[0];
      const dist = calculateDistanceKm(s1.coordinates.lat, s1.coordinates.lng, s2.coordinates.lat, s2.coordinates.lng) || 4;
      const token = Math.min(50, Math.max(10, Math.round(dist * 2.5)));
      return {
        tokenFare: token,
        smartCardFare: Math.round(token * 0.9),
        durationMinutes: Math.max(4, Math.round(dist * 2.2)),
        distanceKm: dist,
        interchanges: 0,
      };
    },
    async getStationLayout(stationId: string): Promise<StationLayout | null> {
      const s = def.stations.find((x) => x.id === stationId);
      return s ? createDefaultStationLayout(s) : null;
    },
    getTicketingGuide(): TicketingGuide {
      return {
        methods: [
          {
            id: 'qr-ticket',
            name: `${def.displayName} QR Ticket / WhatsApp`,
            description: `Official digital QR ticket for ${def.displayName}.`,
            icon: 'QrCode',
            supportedApps: ['Official Metro App', 'WhatsApp', 'Paytm'],
          },
          {
            id: 'ncmc-card',
            name: 'National Common Mobility Card (NCMC)',
            description: 'Tap in and tap out with any RuPay NCMC bank card.',
            icon: 'CreditCard',
            supportedApps: ['RuPay NCMC Cards'],
          },
        ],
        modes: ['qr', 'token', 'card'],
        tips: [`Operating hours: 6:00 AM - 10:00 PM on ${def.displayName}.`],
        rules: ['Ticket valid for 120 minutes from entry.'],
        mistakes: ['Keep QR barcode screen bright when entering AFC gate.'],
      };
    },
  };
}

export const regionalAdapters: Record<string, MetroAdapter> = {};
regionalDefs.forEach((def) => {
  regionalAdapters[def.cityId] = buildRegionalAdapter(def);
});
