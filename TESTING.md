# MetroMate India - Manual Testing Scenarios & Verification Guide

This document guides testing the core interactive flows of MetroMate India.

---

## Scenario 1: Walk to a Station & Geofence Activation

1. **Step**: Launch the app and click **Allow Location Access** in the onboarding dialog (or click **Choose City Manually** > select Delhi NCR or Bengaluru).
2. **Expected Result**: 
   - The map loads with official metro line polylines and station pins.
   - The bottom sheet slides up displaying the nearest stations sorted by walking distance.
   - Live / scheduled train arrivals are shown with platform numbers and countdown minutes.
3. **Geofence Check**: If GPS location is within 150m of a station, the status badge reflects `APPROACHING`; inside 30m it reflects `INSIDE STATION`.

---

## Scenario 2: 3D Indoor Station Navigation & Step-Free Route

1. **Step**: On the Map or Stations tab, select **Rajiv Chowk (Connaught Place)** and click **3D Walk**.
2. **Expected Result**:
   - The 3D scene mounts with the procedural station concourse, CISF security arches, AFC fare turnstiles, and train parked on Platform 1.
   - An animated glowing navigation ribbon appears on the floor connecting the entrance to Platform 1.
   - The stickman avatar smoothly glides along waypoints.
   - The top banner provides step-by-step turn guidance: "Enter via Gate 1" -> "Pass through CISF security" -> "Tap at AFC gates" -> "Proceed to Platform 1".
3. **Interactive Step Test**: Tap **Step +1** in the bottom dock to verify step incrementation and avatar walk cycle response.
4. **Voice Guidance**: Click the speaker icon to test Web Speech API audio announcements.

---

## Scenario 3: Board a Train & In-Train Telemetry

1. **Step**: On any station, click **Board Train** or navigate to the **In-Train** tab.
2. **Expected Result**:
   - The 3D view transitions inside the parametric metro carriage.
   - Exterior walls and interior accent bands use the exact paint livery of the active metro line (e.g. Yellow for DMRC Yellow Line, Purple for Namma Metro).
   - Window streaks scroll continuously creating realistic train speed illusion (34 km/h).
   - The carriage subtly rolls and pitches with simulated rail acceleration sway.
3. **Pose Check**: Click the **Standing / Sitting** button in the bottom dock to verify avatar posture transition.
4. **Route Strip**: The top LED strip indicates previous station, next station, stops remaining, and which side doors will open (`LEFT` / `RIGHT`).

---

## Scenario 4: AI Ticket Scanning & Offline Wallet

1. **Step**: Go to the **Tickets** tab.
2. **Step**: Select **QR Ticket**, **Smart Card**, or **Token Coin** to verify the interactive gate walkthrough cards.
3. **Step**: Use the **Fare Calculator** to select from and to stations; verify token vs. smart card discounted pricing.
4. **Step**: Click **Upload Ticket Image / Screenshot** and choose an image of a metro ticket or receipt.
5. **Expected Result**:
   - On-device `jsQR` decodes the barcode payload.
   - Server-side Gemini 3.8 Flash extracts the operator, fare, origin, destination, and validity.
   - The verified ticket card appears and is saved in IndexedDB.
   - Click **Brightness Boost** to verify high-contrast gate scanning mode.

---

## Scenario 5: Offline Tunnel & Signal Drop Test

1. **Step**: In Chrome DevTools, open the **Network** tab and toggle throttling to **Offline**.
2. **Expected Result**:
   - Stations, lines, and timetables continue to load without errors from IndexedDB (`Dexie`).
   - Train countdowns display with the `OFFLINE-CACHED` badge.
   - 3D Walk mode and In-Train mode run with 100% functionality without requiring external network access.
