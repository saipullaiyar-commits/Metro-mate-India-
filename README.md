# MetroMate India 🚆🇮🇳

A real-time, location-aware, 3D-enhanced companion app for Indian metro rail networks, featuring authentic operator livery matching, live arrival prediction, 3D stickman station walk mode, in-train telemetry, and Gemini AI multimodal ticket scanning.

---

## 1. Features

- **Pan-India 16-City Coverage**: Dedicated adapters for Delhi NCR (DMRC), Mumbai (MMRDA/Metro One), Bengaluru (Namma Metro BMRCL), Chennai (CMRL), Kolkata (Metro Railway), Hyderabad (HMRL/L&T), Kochi (KMRL), Pune, Nagpur, Lucknow, Ahmedabad, Jaipur, Kanpur, Agra, Bhopal, and Indore.
- **Auto-Location & City Detection**: High-accuracy GPS watcher with 1D Kalman smoothing and polygon boundary matching.
- **Authentic Operator Livery**: 3D station models, train exteriors, interior coaches, and UI tokens use the authentic paint scheme and colors of each city's metro system.
- **3D Stickman Walk Mode**: Procedural Three.js station interior with concourses, security arches, AFC fare turnstiles, escalators with moving treads, and platform LED display boards. Stickman avatar animated to user step cadence.
- **In-Train Journey Companion**: Boarding heuristics, 3D carriage with standing/sitting poses, simulated train acceleration sway, live LED route strip, and door opening side alerts.
- **Multimodal AI Ticket Scanner**: `jsQR` barcode decoder + server-side Gemini 3.8 Flash (`gemini-3.8-flash`) extracting operator, origin, destination, fare, validity, and confidence score into an offline IndexedDB ticket wallet with brightness-boost mode.
- **Offline First**: All city stations, lines, timetables, and saved tickets stored in IndexedDB via Dexie.

---

## 2. Per-City Data Availability Matrix

| City | Operator | Live Arrivals | Static Timetable | 3D Layout Graph | Fare Calculation |
| :--- | :--- | :---: | :---: | :---: | :---: |
| **Delhi NCR** | DMRC | LIVE / SCHEDULED | Yes (Peak 3-4m) | Yes | Yes (DMRC Slabs) |
| **Mumbai** | MMRDA / Metro One | LIVE / SCHEDULED | Yes (Line 1/3/7) | Yes | Yes (Distance Slabs) |
| **Bengaluru** | BMRCL (Namma Metro) | LIVE / SCHEDULED | Yes (Purple/Green) | Yes | Yes (BMRCL 5% Off) |
| **Chennai** | CMRL | LIVE / SCHEDULED | Yes (Corridor 1/2) | Yes | Yes (CMRL 20% Off) |
| **Kolkata** | Metro Railway | LIVE / SCHEDULED | Yes (East-West Underwater) | Yes | Yes (Zonal Slabs) |
| **Hyderabad** | HMRL / L&T | LIVE / SCHEDULED | Yes (Corridor 1/2/3) | Yes | Yes (HMRL Slabs) |
| **Kochi** | KMRL | LIVE / SCHEDULED | Yes (Water Metro Intermodal) | Yes | Yes (KMRL Slabs) |
| **Pune** | Maha Metro | SCHEDULED | Yes (Purple/Aqua) | Yes | Yes (Maha Slabs) |
| **Nagpur** | Maha Metro | SCHEDULED | Yes (Orange Line) | Yes | Yes (Maha Slabs) |
| **Lucknow** | UPMRC | SCHEDULED | Yes (North-South) | Yes | Yes (UPMRC Slabs) |
| **Ahmedabad** | GMRC | SCHEDULED | Yes (East-West) | Yes | Yes (GMRC Slabs) |
| **Jaipur** | JMRC | SCHEDULED | Yes (Pink Line) | Yes | Yes (JMRC Slabs) |
| **Kanpur** | UPMRC | SCHEDULED | Yes (Orange Line) | Yes | Yes (UPMRC Slabs) |
| **Agra** | UPMRC | SCHEDULED | Yes (Taj East Corridor) | Yes | Yes (UPMRC Slabs) |
| **Bhopal** | MPMRCL | SCHEDULED | Yes (Orange Line) | Yes | Yes (MP Slabs) |
| **Indore** | MPMRCL | SCHEDULED | Yes (Yellow Ring Line) | Yes | Yes (MP Slabs) |
| **Generic** | Indian Railways / Urban | ESTIMATED | Synthetic Baseline | Template | Flat Slab |

---

## 3. Environment Variables & API Key Security

Create a `.env` file from `.env.example`:

```bash
# Gemini AI for multimodal ticket parsing (Server-side only)
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# Google Maps Platform for map rendering & routes
VITE_GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_API_KEY"
```

### Restricting Your API Keys

1. **Google Maps API Key**:
   - In Google Cloud Console > APIs & Services > Credentials:
   - Application restrictions: **Web sites (HTTP referrers)** -> add your app domain.
   - API restrictions: Restrict key to **Maps JavaScript API**, **Places API (New)**, and **Routes API**.
   - Guide: [Google Cloud API Key Restrictions](https://docs.cloud.google.com/api-keys/docs/add-restrictions-api-keys)
2. **Gemini API Key**:
   - Configured only on the server (`server.ts`).
   - Never exposed to the browser or bundled in client JS.

---

## 4. How to Add a New City Metro Adapter

1. Create a new file `src/adapters/<city_name>.ts` implementing the `MetroAdapter` interface:
```typescript
import { MetroAdapter, Station, Line } from '../types';

export const MyCityAdapter: MetroAdapter = {
  cityId: 'mycity',
  displayName: 'MyCity Metro',
  nativeName: 'मायसिटी मेट्रो',
  operator: 'MyCity Rail Corporation',
  languageCode: 'hi',
  bounds: { north: 25.5, south: 25.0, east: 85.5, west: 85.0 },
  center: { lat: 25.2, lng: 85.2 },
  dataQuality: { realtime: true, staticSchedule: true, indoorMaps: true, fareApi: true },
  async getStations() { /* Return Station[] */ },
  async getLines() { /* Return Line[] */ },
  async getArrivals(stationId) { /* Return Arrival[] */ },
  async getFare(fromId, toId, mode) { /* Return Fare */ },
  async getStationLayout(stationId) { /* Return StationLayout */ },
  getTicketingGuide() { /* Return TicketingGuide */ }
};
```
2. Export your adapter in `src/adapters/index.ts` and add it to `allAdapters`.

---

## 5. Building the Android APK with Capacitor

To build an Android APK from this project:

```bash
# 1. Install Capacitor CLI and core
npm install @capacitor/core @capacitor/cli @capacitor/android

# 2. Initialize Capacitor
npx cap init "MetroMate India" "in.metromate.app" --web-dir=dist

# 3. Build Web Bundle
npm run build

# 4. Add Android Platform
npx cap add android

# 5. Sync Assets
npx cap sync

# 6. Open in Android Studio to Build APK
npx cap open android
```

---

## 6. Known Limitations

- Real-time GTFS-RT feeds for Indian transit agencies vary by open-data publisher uptime. When feeds are offline or unconfigured, the app falls back to authentic scheduled timetables clearly marked as `SCHEDULED`.
- On mobile devices without a gyroscope or accelerometer, step cadence defaults to standard walking pace (90 steps/min).
