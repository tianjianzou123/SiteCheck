# Technical questions: concise answers to understand

These are study notes. Answers given in the assessment should reflect the version actually demonstrated and should be explained naturally rather than memorised word for word.

## What makes SiteCheck more than a TODO app?

It models a complete outdoor issue-reporting workflow. A report contains facility type, severity, status, checklist evidence, a real camera photo, GPS coordinates, manual location notes, timestamps, and persistent storage. The same data drives dashboard statistics, the searchable list, details, and map markers.

## Where is CRUD implemented?

- **Create:** `form.tsx` builds a validated `SiteReport`; `createReport` saves it.
- **Read:** the provider loads all reports from AsyncStorage; dashboard, map, and details read the shared state.
- **Update:** the edit form replaces the matching record; the detail screen can also update status.
- **Delete:** a confirmation calls `deleteReport`, which writes the reduced collection before cleaning its managed photo.

## Why use AsyncStorage?

The project needs local persistence for a small set of structured JSON records and has no server. AsyncStorage is simple, supported in Expo Go, and remains available after restarting the app. It is not encrypted, so it is not used for passwords or secrets.

## Why are photos not stored directly in AsyncStorage?

Images are large binary files. The camera initially returns a temporary file URI. SiteCheck copies that file into the app document directory with Expo File System and stores only the persistent URI plus metadata in AsyncStorage. This avoids oversized JSON and prevents the camera cache from disappearing after a restart.

## What does `useState` do here?

It stores screen-local values that cause a re-render when they change, such as form inputs, search text, selected filter, captured location, camera preview, validation errors, and loading flags.

## What does `useEffect` do here?

The report provider uses it once when mounted to load saved reports from AsyncStorage. The map screen uses it to focus a marker when a detail screen passes a report ID. Effects are used for synchronising with storage or map behaviour, not for values that can be calculated during rendering.

## Why use `useMemo`?

Derived values such as filtered reports, status counts, mapped reports, and a formatted location string are recalculated only when their inputs change. It also helps keep the context value stable for consumers.

## Why use `useCallback`?

CRUD functions keep stable identities between renders. This is helpful when they are placed inside context or used as dependencies, and it prevents unnecessary downstream changes.

## Why use Context?

Dashboard, map, form, and details all need the same reports. A provider creates one source of truth, so a saved edit immediately updates statistics, list cards, and map markers without passing props through every navigator level.

## How is data consistency protected?

CRUD operations calculate the next collection and await the AsyncStorage write before updating displayed state. If storage fails, the mutation throws and the previous in-memory list remains. A ref holds the latest committed collection so async callbacks do not update stale data.

## How are IDs generated?

`generateReportId` combines the current timestamp and a random suffix, for example `SC-M...-A1B2C`. This is sufficiently unique for a single-device coursework app and is generated once when a new form opens.

## How does camera permission work?

Permission is requested only after the user taps the camera action. If it is denied, the app shows an explanatory alert and remains usable. If granted, Expo Image Picker launches the real camera. Cancellation is treated as a normal outcome rather than an error.

## How does GPS permission work?

SiteCheck requests foreground location only after the user taps **Capture current GPS**. After permission is granted, it requests one high-accuracy position and applies a 20-second timeout. Permission refusal, disabled services, timeout, reduced iPhone accuracy, and other failures are handled without crashing. It does not use background tracking.

## Why allow manual location notes?

Coordinates identify a point but may not identify the exact asset, entrance, or side of a building. Notes add operational context. The map also allows the user to correct a GPS marker or place one manually when GPS is unavailable. The saved source distinguishes GPS, adjusted GPS, manual placement, and migrated legacy data, so manual input is never presented as a hardware result.

## How does the map stay synchronised?

The map reads the same report context as the dashboard. It filters records with coordinates and creates one marker per report. Editing status changes its marker colour; deleting the report removes its marker on the next render.

## Does the app work fully offline?

The report records, checklist, coordinates, and persisted photos work offline. Standard map tiles may require the internet, so the app explicitly warns about that limitation. Claiming fully offline maps would be inaccurate without a tile-caching solution.

## How are validation and errors handled?

The form requires a title, meaningful description, real site photo, coordinates from GPS or the manual-map fallback, and location notes. Async operations have visible loading states and `try/catch` handling. The UI also covers empty lists, corrupt storage errors, deleted routes, missing image files, permission refusal, camera cancellation, and location timeout.

## Why reuse the same form for create and edit?

It avoids duplicated validation and UI logic. The optional route ID determines whether the form creates a new report or hydrates and updates an existing report. This is easier to maintain and demonstrates component reuse.

## What would be improved with more time?

After the core workflow is proven, reasonable extensions are CSV export, attachment galleries, configurable checklist templates, offline map tiles, encrypted or relational storage for a larger data set, automated tests, and an optional authenticated backend. They are deliberately outside the current stable scope.

