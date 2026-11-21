# SiteCheck iPhone test plan

This document records the final regression performed on the actual demonstration
iPhone. Results describe what was observed on the phone. Fields that were not captured
during the session are labelled **Not recorded** rather than left as pending.

## Test environment

| Item | Actual value |
|---|---|
| Test date | 20 November 2026 |
| Tester | Tianjian Zou |
| iPhone model | Not recorded |
| iOS version | Not recorded |
| Expo Go version | Not recorded |
| SiteCheck commit hash | `0b3461a` |
| Network used | Wi-Fi; offline behaviour also checked after saving |

Status values: `Pass`, `Fail`, or `Blocked`.

## Physical-device test cases

| ID | Test and steps | Expected result | Actual result | Status |
|---|---|---|---|---|
| T01 | Open SiteCheck in Expo Go for the first time | App opens without a crash; empty dashboard shows zero inspection-outcome counts and a helpful message | App opened correctly and the initial dashboard state was displayed | Pass |
| T02 | Open New Report, tap **Take site photo**, and allow camera access | The real iPhone camera opens; a captured facility photo appears in the preview | Native iPhone camera opened and the captured facility photo appeared in the form | Pass |
| T03 | Deny/reset camera access and tap **Take site photo** | A clear permission message appears; the app remains open and no fake photo is created | Permission feedback appeared and the app remained usable without creating a photo | Pass |
| T04 | Turn on Precise Location, tap **Capture current GPS**, and allow While Using permission outdoors | Latitude, longitude, capture method, and accuracy appear without a crash | Real coordinates, Current GPS capture, timestamp, and accuracy were shown | Pass |
| T05 | Deny/reset location permission, then try GPS capture | A clear message appears; the user can place a manual map marker, which is labelled as manual rather than GPS | The fallback message appeared and the manually placed marker was identified as manual | Pass |
| T06 | Enter a valid routine inspection with Normal outcome, photo, location, notes, and checklist; save | One normal inspection appears immediately; no Open/Resolved workflow is shown for it | The inspection saved and appeared on the dashboard with the expected Normal state | Pass |
| T07 | Tap the saved dashboard card | Detail screen shows the correct photo, issue data, coordinates, source, accuracy, notes, and checklist | The saved record opened with matching photo, location, timestamps, notes, and checklist | Pass |
| T08 | Search by title/location and use every status filter | Only matching records appear; clearing controls restores the list | Search and outcome filters returned the expected records and cleared correctly | Pass |
| T09 | Edit the outcome from Normal to Needs attention or Fault found, then enter severity/status | Details, dashboard counts, and map use the updated persistent values | The edited outcome, severity, status, and Last updated time appeared across the app | Pass |
| T10 | Use the detail-screen status action | Status advances Open → In progress → Resolved and marker colour/counts update | The status advanced through the workflow and the dashboard/map state updated | Pass |
| T11 | Tap Delete, then cancel | The report and its files remain unchanged | Cancelling the confirmation preserved the record and its photo | Pass |
| T12 | Tap Delete again and confirm | The report disappears from list, counts, and map; the app returns to Dashboard | Confirming deletion removed the record from the dashboard and map | Pass |
| T13 | Save at least two reports, fully close Expo Go, then reopen the project | All report fields remain after restart | Expo Go was removed from the iOS app switcher and reopened; the saved records remained | Pass |
| T14 | After restart, open a report that contains a photo | The persisted image reloads from the application document directory | The same saved record reopened with its original photo after relaunch | Pass |
| T15 | Save GPS inspections and open Map | A normal inspection uses a green marker; issue markers follow workflow status and open the correct inspection | Markers used the expected colours and opened the correct inspection | Pass |
| T16 | Capture GPS, open **Fine-tune marker on map**, move the pin, and save | The adjusted coordinate persists and Details says **GPS point adjusted on map** | The adjusted coordinate persisted and the detail view identified the adjusted GPS point | Pass |
| T17 | Disable network after saving a report | Reports, details, photo, checklist, and coordinates remain; map tiles may be absent and the limitation is shown | Saved records and photos remained available; the map displayed its network limitation | Pass |
| T18 | Try to save with blank/short text, no photo, no location, or no location notes | No invalid report is created; highlighted feedback explains each required field | Validation blocked each incomplete submission and highlighted the missing input | Pass |
| T19 | On iPhone, turn off Precise Location and capture again | Approximate-location notice appears; manual correction remains available | Approximate-location feedback appeared and manual marker correction remained available | Pass |
| T20 | Cancel the camera, retry GPS in a poor-signal area, and navigate rapidly | Cancellation/timeouts are handled; no frozen control, duplicate report, or crash occurs | Camera cancellation and GPS retry returned control without a duplicate record or crash | Pass |
| T21 | Create → read → edit → status update → restart → delete as one recorded sequence | CRUD, persistence, camera, GPS, statistics, map, and cleanup stay consistent | The complete sequence ran on the real iPhone and preserved the same record and photo across relaunch | Pass |

## Current automated source checks

These checks were run on the Windows development computer on 20 November 2026.
They validate the current `1.3.0` source but do not substitute for the tests above.

| Check | Command | Result |
|---|---|---|
| TypeScript strict checking | `npm run typecheck` | Pass |
| ESLint | `npm run lint` | Pass |
| Expo dependency/config health | `npx expo-doctor --verbose` | Pass — 20/20 checks |
| iOS production bundle | `npx expo export --platform ios --clear` | Pass — 1,278 modules; Hermes bundle generated |
| Android production bundle | `npx expo export --platform android --clear` | Pass — 1,272 modules; Hermes bundle generated |
| Expo public config | `npx expo config --type public` | Pass — version 1.3.0; foreground location present; microphone/background location absent |

## Emulator evidence rule

Android emulator tests may confirm navigation, CRUD, validation, persistence, and map
data synchronisation. Emulator camera scenes and injected coordinates must be labelled
**simulated** in notes and must not be used as proof of real hardware camera or GPS.

The following regression was performed on the official Android 15 emulator on
20 November 2026. It is development evidence only.

| ID | Test performed | Observed result | Status |
|---|---|---|---|
| E01 | Open current `1.2.0` source with an older saved report | Report loaded, the removed voice field was ignored, and the legacy manual location remained correctly labelled | Pass |
| E02 | Advance the saved report from Open to In progress | Detail action changed and Dashboard counts changed from Open 1 to In progress 1 | Pass |
| E03 | Inject `55.8642, -4.2518` through emulator controls and tap GPS capture | Form showed `Current GPS capture` with coordinates and simulated accuracy of ±5 m | Pass — simulated |
| E04 | Launch emulator camera, capture its synthetic scene, crop it, and save the edit | Preview appeared, report saved, and Details displayed the image | Pass — simulated |
| E05 | Force-stop Expo Go and reopen the project | Report, status, photo, coordinates, source, and accuracy remained available | Pass |
| E06 | Open Map and tap the marker | Marker appeared at the injected coordinate; popup showed report data and `Current GPS capture` | Pass — simulated coordinate |

## Defect log

| Defect ID | Test ID | What happened | Cause | Fix | Re-test result |
|---|---|---|---|---|---|
| None | T01–T21 | No unresolved defect was observed during the final physical-device regression | N/A | N/A | Pass |

## Final regression rule

The final regression above was completed before the coursework presentation was
prepared. After any future change to storage, navigation, camera, GPS, photos,
permissions, or maps, repeat T02, T04, T06, T09, T12, T13, T14, T15, T17, T18,
and T21.
