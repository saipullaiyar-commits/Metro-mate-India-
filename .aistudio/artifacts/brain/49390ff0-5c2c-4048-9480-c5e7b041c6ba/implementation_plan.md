# MetroMate India: Refined Design & Physical Ticket AI Navigation

A redesigned, high-fidelity mobile transit companion matching the modern, minimalist aesthetic of the reference design (Image 3), featuring bulk natural-language physical ticket comprehension with Gemini AI, and context-aware GPS geofencing that only unlocks 3D walk and in-train modes when physically at a metro station.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following decisions were confirmed with the user in this revision:

- **Image 3 Modern Aesthetic Redesign**: Complete transformation of the UI to match the clean, luxury mobile travel style from Image 3:
  - Clean light-mode-first aesthetic with soft neutral canvas (`bg-slate-50`), crisp white cards (`bg-white`), and generous rounded geometry (`rounded-3xl` / `rounded-2xl`).
  - Top search pill with date/passenger filter aesthetics adapted for transit ("Select City / Station · Today").
  - Rich station discovery cards with photographic visual anchors, station ratings, lines served, and walk times.
  - Interactive accordion schedule cards ("Morning Peak", "Afternoon Regular", "Evening Rush") and station stops timeline.
  - Floating capsule bottom navigation bar with clean iconography.
  - Sticky bottom action button ("Navigate to Entrance Gate", "Add Physical Ticket", etc.).
- **Bulk Natural-Language AI Physical Ticket Entry**: Commuters who purchase paper tickets, counter tokens, or tourist passes can simply dictate or paste their trip details in bulk (e.g. *"Got a ₹40 token at Rajiv Chowk counter for Blue Line platform 3 towards Noida Electronic City via Gate 2"*). Server-side Gemini 3.8 Flash summarizes the bulk input into structured trip parameters (Origin, Destination, Platform, Gate, Interchange) and auto-generates the step-by-step navigation timeline.
- **Strict GPS Geofence Gating for 3D Walk & In-Train**:
  - The app will **NO LONGER** display simulated in-train rides or 3D concourse walk modes when the commuter is far away from a metro station.
  - When outside the station, the app presents real-world navigation: walking/transit directions to the station entrance gate, timetable schedules, line maps, and fare information.
  - Only when GPS accuracy confirms the user has entered the station perimeter (within 150m approaching or at the entrance) does the app surface the contextual 3D Station Walkway and In-Train boarding assistant.

---

## 1. Overview & Core Concept

MetroMate India is restructured as a premium, intuitive transit companion for Indian metro rail systems (covering all 16 cities), bridging the gap between physical ticket counter purchases and digital navigation:

- **What It Does**: 
  1. Presents nearby stations, lines, and timetables using the elegant layout from Image 3.
  2. Accepts natural-language bulk descriptions of physical counter tokens and paper tickets, using Gemini AI to extract origin, destination, platform number, and entry gate.
  3. Guides the user to the closest station entrance via turn-by-turn walking directions.
  4. Contextually unlocks 3D concourse navigation only when the commuter actually arrives at the station geofence.
- **Visual Reference Alignment**: Mirroring Image 3's clean typography, pill-free metadata, rounded image cards, accordion timelines, and floating bottom navigation bar.

---

## 2. User Experience & Visual Design (Image 3 Alignment)

```
┌──────────────────────────────────────────────┐
│  [ Search Station / City ]  [ Filters ]      │  <- Pill-style Search Header
├──────────────────────────────────────────────┤
│  Top Stations & Nearby      [ See all > ]    │
│  ┌──────────────────┐  ┌──────────────────┐  │  <- Rounded-3xl Visual Cards
│  │ [Station Photo]  │  │ [Station Photo]  │  │     with clean badges,
│  │ Rajiv Chowk      │  │ Kashmere Gate    │  │     distance, and line dots
│  │ 4.8 ★ · 2.1 km   │  │ 4.7 ★ · 4.5 km   │  │
│  └──────────────────┘  └──────────────────┘  │
├──────────────────────────────────────────────┤
│  Station Detail & Schedule Accordion         │  <- Image 3 Tabbed Accordions
│  [ Schedule ]  [ Entrances ]  [ Physical AI ]│
│  ┌────────────────────────────────────────┐  │
│  │ ▾ Morning Peak (06:00 - 10:00)         │  │
│  │   Yellow Line · Every 3.5 min          │  │
│  │   Platform 1 Towards Samaypur Badli    │  │
│  └────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────┐  │
│  │ ▸ Afternoon Normal (10:00 - 17:00)     │  │
│  └────────────────────────────────────────┘  │
├──────────────────────────────────────────────┤
│  [    Navigate to Entrance Gate 1    ]       │  <- Sticky Full-Width CTA
├──────────────────────────────────────────────┤
│    [ Explore ]   [ Map ]   [ Ticket AI ]     │  <- Floating Pill Bottom Bar
└──────────────────────────────────────────────┘
```

### Visual Specifications:
- **Canvas & Surfaces**: Soft oyster off-white (`bg-slate-50`), crisp white card containers (`bg-white`), hairline borders (`border-slate-100` / `border-slate-200`).
- **Corner Radii**: Container cards use `rounded-3xl` (24px to 28px); buttons and badges use `rounded-2xl` (16px).
- **Typography**: `Plus Jakarta Sans` for titles and body prose; `JetBrains Mono` / tabular numerals for times, platform numbers, and fares.
- **Top Bar & Search**: Clean pill bar with magnifying glass, city label, and filter button.
- **Floating Pill Bottom Navigation**: Centered floating capsule with subtle drop shadow (`shadow-2xl shadow-slate-900/10`) featuring active dot indicators.

---

## 3. Physical Ticket AI Navigation Pipeline

1. **Bulk Text & Voice Input**: A dedicated modal/tab where commuters type or paste unstructured ticket notes, e.g.:
   > *"I bought a single journey token at counter 4 in Rajiv Chowk. Cost 40 rs. Need to go to Noida Electronic City via Blue Line. The guard told me to enter through Gate 2 and take escalator to Platform 3."*
2. **Server-Side Gemini 3.8 Flash Processing**:
   - Express endpoint `POST /api/tickets/parse-text` calls `@google/genai` with structured JSON schema:
     - `originStation`: e.g. "Rajiv Chowk"
     - `destinationStation`: e.g. "Noida Electronic City"
     - `lineId` / `lineName`: e.g. "Blue Line"
     - `platformNumber`: "3"
     - `entranceGate`: "Gate 2"
     - `farePaid`: 40
     - `ticketType`: "Token"
     - `navigationInstructions`: string[] (ordered step list)
3. **Structured Navigation Card**:
   - Displays the extracted journey plan in an Image 3 styled card.
   - Shows walking directions to the specified entrance gate on the map.
   - Saves the parsed ticket to the offline wallet.

---

## 4. Location Engine & Geofence Activation Rules

- **Far Away (> 200m)**:
  - App state: `OUTSIDE_STATION`.
  - UI shows walking/transit route on Google Map to Gate 1 / Gate 2.
  - 3D Walk and In-Train modes are hidden from navigation.
- **Approaching (50m - 200m)**:
  - App state: `APPROACHING_STATION`.
  - Prominent card alert: "Approaching {Station Name} · Enter via {Gate Number}".
- **Inside Station (< 50m / Geofence Entry)**:
  - App state: `AT_STATION`.
  - Contextual banner unlocks: "You have arrived at the station. Tap to open 3D Concourse Navigation".
- **Boarded Train Heuristic**:
  - Requires explicit user tap ("I have boarded the train") OR speed > 20 km/h along metro track coordinates from within platform bounds.

---

## 5. Technical Implementation Steps

1. **Backend Endpoint**: Add `POST /api/tickets/parse-text` in `server.ts` using `gemini-3.8-flash` with a strict `responseSchema` for bulk natural-language physical ticket parsing.
2. **Design System & UI Overhaul**:
   - Create Image 3 styled discovery feed with photo header cards, ratings, line pills, and horizontal scroller.
   - Implement Image 3 tabbed accordion timeline for train schedules, gate lists, and stop sequences.
   - Build the Floating Capsule Bottom Nav bar.
3. **Physical Ticket AI Modal / Tab**:
   - Text area for bulk ticket entry with quick sample chips.
   - Instant AI summarization returning origin, destination, platform, gate, and step sequence.
4. **Context-Aware Geofence Logic**:
   - Filter out 3D walk and in-train modes from the main nav bar when `geofenceState === 'OUTSIDE'`.
   - Provide a toggleable "Station Demo Simulation" button in settings for users who want to preview 3D walk when away from a station.
5. **Verification**: Run `compile_applet` and `lint_applet` together to ensure flawless compilation.
