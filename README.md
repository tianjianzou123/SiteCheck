# SiteCheck

SiteCheck is a React Native mobile application for recording routine facility inspections and managing identified issues across a large outdoor site such as a university campus, public park, or industrial estate.

The application supports two connected field workflows. A normal facility can be recorded as a completed routine inspection, while an observation that needs attention or contains a fault adds severity and an **Open → In progress → Resolved** follow-up workflow. Every inspection can include photographic evidence, a GPS position, location notes, and a facility-specific checklist. Records are stored locally so the core workflow remains usable without a network connection.

This project implements the COMP10013 coursework category **Reporting App for Large Outdoor Site**. It is not a basic task list and it does not claim to detect faults automatically.

## Current features

- Professional dashboard with total, normal, attention, and fault counts
- Separate issue follow-up summary for open, in-progress, and resolved work
- Search by inspection title, facility type, or location description
- Filter inspections by outcome
- Create, read, update, and delete inspection records
- Facility types for lighting, benches, signs, waste bins, telecom equipment, and other assets
- Inspection outcomes: Normal, Needs attention, and Fault found
- Severity and Open/In progress/Resolved status appear only when follow-up is needed
- Facility-specific inspection checklists
- Real camera capture with permission and cancellation handling
- Real foreground GPS capture with permission, timeout, and failure handling
- GPS marker correction and truthful manual-map fallback
- Persistent local JSON data through AsyncStorage
- Persistent photo copies in the application's document directory
- Normal inspections use green map markers; issue markers reflect follow-up status
- Inspection details, direct issue-status update, edit, and confirmed deletion
- Local record and photo cleanup when an inspection is deleted
- Empty, loading, error, and missing-photo states

## Technology

- React Native 0.88 and React 19
- Expo SDK 58 and Expo Go
- Expo Router for file-based navigation
- TypeScript with strict type checking
- React Hooks and Context for application state
- AsyncStorage for structured local report persistence
- Expo Image Picker for camera access
- Expo Location for foreground geolocation
- Expo File System for persistent image storage
- React Native WebView with Leaflet/OpenStreetMap for inspection-location markers (no Google API key required)

## Why these technologies were selected

**AsyncStorage** is appropriate because SiteCheck stores a small collection of structured report records on one device and does not require a remote database. Data is serialised to JSON under one versioned key. It is persistent but not encrypted, so the app deliberately avoids passwords and sensitive personal data.

**Expo File System** is used separately for photos because AsyncStorage is not designed for large binary files. The app copies the camera image from its temporary location into the app document directory, then stores only the persistent URI and metadata in the report.

**React Context and Hooks** provide one shared in-memory report collection for the dashboard, map, form, and detail screens. Every successful mutation is written to AsyncStorage before the UI state is committed, keeping the map, list, and statistics consistent.

**Camera and GPS** are part of the real inspection workflow. A photo records the observed facility condition and GPS identifies the physical location of the asset. Both APIs handle permission refusal and operational errors without crashing the app.

## Project structure

```text
src/
├── app/                         Expo Router screens
│   ├── (tabs)/
│   │   ├── index.tsx            Dashboard
│   │   └── map.tsx              Site map
│   └── report/
│       ├── form.tsx             Create and edit report
│       └── [id].tsx             Report details
├── components/                  Reusable UI components
├── constants/                   Theme, options, and checklist templates
├── context/ReportContext.tsx    Shared report state and CRUD operations
├── hooks/useReports.ts          Safe access to report context
├── services/
│   ├── reportStorage.ts         AsyncStorage persistence
│   ├── photoStorage.ts          Persistent image file management
│   └── locationService.ts       Location permission, capture, and timeout
├── types/report.ts              TypeScript data model
└── utils/reportUtils.ts         Validation, IDs, dates, counts, and sorting
```

## Data model

Each inspection record includes:

- unique inspection ID
- inspection title and observation
- facility type
- inspection outcome
- optional issue severity and follow-up status
- inspection, creation, update, and optional resolution timestamps
- required persistent photo metadata for newly saved reports
- required latitude, longitude, optional GPS accuracy, source, and capture timestamp
- manual location description
- facility-specific checklist results
- schema version

The complete TypeScript model is defined in `src/types/report.ts`.

## Installation

Requirements:

- Node.js and npm
- Expo Go on a compatible Android or iOS phone
- phone and computer connected to the same network, or Expo tunnel mode if needed

Install and start:

```bash
npm install
npm start
```

On iPhone, install **Expo Go** from the App Store, scan the terminal QR code with the
Camera app, and open the project in Expo Go. Camera, GPS, file persistence, and map
behaviour must be evaluated on the real phone rather than inferred from a desktop
browser or simulated location.

An installable `.ipa` is not included. Producing and distributing an iOS binary requires
Apple signing credentials and, for normal device distribution, an Apple Developer
account. Expo Go is the intended coursework test route until those credentials exist.

## Quality checks

```bash
npm run lint
npm run typecheck
npm run doctor
npx expo export --platform android
```

Current version `1.3.0` source validation completed on 20 November 2026:

- ESLint (`npm run lint`): passed
- TypeScript strict check: passed
- Expo Doctor: 20/20 checks passed
- iOS Metro/Hermes production export: passed (1,278 modules bundled)
- Android Metro/Hermes production export: passed (1,272 modules bundled)
- Expo config: foreground fine/coarse location enabled; microphone and background location disabled
- Legacy version 3 records are migrated in memory to the version 4 inspection-outcome model

These checks prove that the source is well formed and can be bundled for iOS. They do
**not** prove real camera or GPS behaviour and do not replace the iPhone tests in
`docs/TEST_PLAN.md`.

## Permissions

- **Camera:** requested only when the user chooses **Take site photo**.
- **Foreground location:** requested only when the user chooses **Capture current GPS**.
- No microphone, background location, account, or remote-server permission is required.

If GPS is unavailable, a user can still enter a clear manual location description. SiteCheck does not pretend that a manual description is a GPS result.

## Offline behaviour

Inspection records, checklist answers, coordinates, and persisted photos are available offline after saving. The base map is supplied by an external map provider, so map tiles may not load without a network connection. The app states this limitation on the map screen rather than claiming complete offline mapping.

## Known limitations

- Data belongs to one installation on one device; there is no cloud synchronisation or user account.
- AsyncStorage is not encrypted and must not be used for secrets.
- Map tiles may require internet access.
- GPS accuracy depends on the phone, environment, and satellite/network availability.
- Photo, GPS, permission refusal, restart persistence, and map behaviour still require documented iPhone testing.
- iOS cannot be locally simulated from this Windows computer; Expo Go on the borrowed iPhone is required.
- `npm audit` currently reports three moderate `minimatch` advisories through Expo's fingerprint dependency; its proposed forced fix would downgrade Expo across major SDK versions, so no unsafe forced change was applied.
- Actual screenshots will be added only after the relevant screens are run and captured on the test phone.

## Coursework evidence

- Requirement mapping: `docs/COURSEWORK_MAPPING.md`
- Physical-device and exception test record: `docs/TEST_PLAN.md`
- iPhone setup and evidence guide: `docs/IPHONE_TEST_GUIDE.md`
- Honest Git/GitHub next steps: `docs/GIT_AND_GITHUB_NEXT_STEPS.md`
- Technical questions and explanations: `docs/TECHNICAL_QA.md`

## Academic and evidence note

All screenshots, test outcomes, demonstrations, and spoken explanations submitted for assessment should match the version that was actually run on the student's phone. No simulated screenshot or unperformed test should be presented as evidence.

