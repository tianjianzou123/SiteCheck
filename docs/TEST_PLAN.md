# SiteCheck iPhone test plan

Do not mark a test **Pass** until it has been performed on the actual demonstration
iPhone. Record what was observed, not what the code is intended to do. A simulated
Android position may be useful for debugging but is not evidence of real GPS use.

## Test environment

| Item | Actual value |
|---|---|
| Test date | Pending |
| Tester | Pending |
| iPhone model | Pending |
| iOS version | Pending |
| Expo Go version | Pending |
| SiteCheck commit hash | Pending |
| Network used | Pending |

Status values: `Not run`, `Pass`, `Fail`, or `Blocked`.

## Physical-device test cases

| ID | Test and steps | Expected result | Actual result | Status |
|---|---|---|---|---|
| T01 | Open SiteCheck in Expo Go for the first time | App opens without a crash; empty dashboard shows zero inspection-outcome counts and a helpful message | Pending | Not run |
| T02 | Open New Report, tap **Take site photo**, and allow camera access | The real iPhone camera opens; a captured facility photo appears in the preview | Pending | Not run |
| T03 | Deny/reset camera access and tap **Take site photo** | A clear permission message appears; the app remains open and no fake photo is created | Pending | Not run |
| T04 | Turn on Precise Location, tap **Capture current GPS**, and allow While Using permission outdoors | Latitude, longitude, capture method, and accuracy appear without a crash | Pending | Not run |
| T05 | Deny/reset location permission, then try GPS capture | A clear message appears; the user can place a manual map marker, which is labelled as manual rather than GPS | Pending | Not run |
| T06 | Enter a valid routine inspection with Normal outcome, photo, location, notes, and checklist; save | One normal inspection appears immediately; no Open/Resolved workflow is shown for it | Pending | Not run |
| T07 | Tap the saved dashboard card | Detail screen shows the correct photo, issue data, coordinates, source, accuracy, notes, and checklist | Pending | Not run |
| T08 | Search by title/location and use every status filter | Only matching records appear; clearing controls restores the list | Pending | Not run |
| T09 | Edit the outcome from Normal to Needs attention or Fault found, then enter severity/status | Details, dashboard counts, and map use the updated persistent values | Pending | Not run |
| T10 | Use the detail-screen status action | Status advances Open → In progress → Resolved and marker colour/counts update | Pending | Not run |
| T11 | Tap Delete, then cancel | The report and its files remain unchanged | Pending | Not run |
| T12 | Tap Delete again and confirm | The report disappears from list, counts, and map; the app returns to Dashboard | Pending | Not run |
| T13 | Save at least two reports, fully close Expo Go, then reopen the project | All report fields remain after restart | Pending | Not run |
| T14 | After restart, open a report that contains a photo | The persisted image reloads from the application document directory | Pending | Not run |
| T15 | Save GPS inspections and open Map | A normal inspection uses a green marker; issue markers follow workflow status and open the correct inspection | Pending | Not run |
| T16 | Capture GPS, open **Fine-tune marker on map**, move the pin, and save | The adjusted coordinate persists and Details says **GPS point adjusted on map** | Pending | Not run |
| T17 | Disable network after saving a report | Reports, details, photo, checklist, and coordinates remain; map tiles may be absent and the limitation is shown | Pending | Not run |
| T18 | Try to save with blank/short text, no photo, no location, or no location notes | No invalid report is created; highlighted feedback explains each required field | Pending | Not run |
| T19 | On iPhone, turn off Precise Location and capture again | Approximate-location notice appears; manual correction remains available | Pending | Not run |
| T20 | Cancel the camera, retry GPS in a poor-signal area, and navigate rapidly | Cancellation/timeouts are handled; no frozen control, duplicate report, or crash occurs | Pending | Not run |
| T21 | Create → read → edit → status update → restart → delete as one recorded sequence | CRUD, persistence, camera, GPS, statistics, map, and cleanup stay consistent | Pending | Not run |

## Current automated source checks

These checks were run on the Windows development computer on 20 November 2026.
They validate the current `1.2.0` source but do not substitute for the tests above.

| Check | Command | Result |
|---|---|---|
| TypeScript strict checking | `npm run typecheck` | Pass |
| ESLint | `npm run lint` | Pass |
| Expo dependency/config health | `npx expo-doctor --verbose` | Pass — 20/20 checks |
| iOS production bundle | `npx expo export --platform ios --clear` | Pass — 1,278 modules; Hermes bundle generated |
| Android production bundle | `npx expo export --platform android --clear` | Pass — 1,272 modules; Hermes bundle generated |
| Expo public config | `npx expo config --type public` | Pass — version 1.2.0; foreground location present; microphone/background location absent |

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
| Pending | Pending | Add only defects actually observed | Pending | Pending | Pending |

## Final regression rule

After any change to storage, navigation, camera, GPS, photos, permissions, or maps,
repeat T02, T04, T06, T09, T12, T13, T14, T15, T17, T18, and T21 before recording
the coursework video.
