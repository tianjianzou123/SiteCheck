# Coursework requirement mapping

This file maps the COMP10013 coursework requirements to the current SiteCheck implementation and the evidence recorded in TEST_PLAN.md. Test IDs below match the physical-device test plan.

| Coursework requirement | SiteCheck implementation | Main source evidence | Verification evidence |
|---|---|---|---|
| React Native mobile app | Expo SDK 58 app with native navigation and mobile layouts | src/app, app.json | iOS bundle export; real iPhone regression T01-T21 |
| Full Create operation | Validated form creates routine inspections and follow-up issues | src/app/report/form.tsx, src/context/ReportContext.tsx | T06 |
| Full Read operation | Dashboard, map, and details read saved reports | src/app/(tabs)/index.tsx, map.tsx, report/[id].tsx | T06 dashboard, T07 details, T15 map |
| Full Update operation | Edit form and direct follow-up status transition persist changes | form.tsx, report/[id].tsx, ReportContext.tsx | T09 edit, T10 status transition |
| Full Delete operation | Confirmation removes a report and attempts managed-photo cleanup | report/[id].tsx, ReportContext.tsx, photoStorage.ts | T11 cancel confirmation, T12 confirm deletion |
| Local persistent storage | Versioned JSON collection saved through AsyncStorage | reportStorage.ts | T13 relaunch persistence, T21 end-to-end sequence |
| Persistent photos | Camera image copied to app document storage; persistent URI stored in report | photoStorage.ts, form.tsx | T02 capture, T14 photo after relaunch, T21 |
| Device API 1: Camera | Permission request, native capture, preview, cancellation and error handling | form.tsx, app.json | T02 capture, T03 permission denial, T20 cancellation |
| Device API 2: GPS | Foreground permission, high-accuracy one-shot capture, timeout, approximate-location notice and failure handling | locationService.ts, form.tsx, app.json | T04 GPS capture, T05 denial/manual fallback, T16 marker adjustment, T19 approximate location, T20 poor-signal retry |
| Map | Saved positions become markers; normal inspections and issues use meaningful colours | src/app/(tabs)/map.tsx | T15 markers, T16 marker adjustment |
| Business depth | Routine outcomes, facility-specific checklists, severity and issue follow-up workflow | reportOptions.ts, ChecklistEditor.tsx, report/[id].tsx | T06 normal inspection, T09 issue edit, T10 status workflow |
| React Hooks | State, effects, memoisation, callbacks, context and refs | UI screens and ReportContext.tsx | Source walkthrough in Part B |
| Reusable components | Buttons, fields, chips, cards, badges, checklist and empty/loading states | src/components | Source review and Part B walkthrough |
| Error handling | Permission refusal, timeout, corrupt storage, missing photo, invalid form and missing record paths | services and screen alerts/states | T03, T05, T18 and T20 cover the corresponding tested permission, fallback, validation and timeout flows |
| GitHub repository | Public source, README, test plan and project structure | Repository root | Public main branch is accessible; README has clone, install and run instructions |
| Development history | Commits provide an honest record of project changes | Git history | Public repository commit history |
| Phone demonstration | CRUD, persistence, camera, GPS, map and source-code explanation | Whole app | T21 complete real-iPhone workflow; Part B video should use the tested app version |

## Scope decisions

Included because they add evidence and practical value:

- dashboard outcome statistics and issue follow-up summary
- search and outcome filtering
- map markers
- GPS marker correction and a clearly labelled manual-map fallback
- facility checklists
- issue-status progression
- persistent photo files
- an explicit limitation for online map tiles

Excluded to keep the project reliable and explainable:

- remote backend or authentication
- background location tracking
- automatic fault detection
- paid maps or cloud services
- chat, notifications or multi-user assignment
- decorative animation unrelated to the reporting workflow

## Evidence notes before submission

1. Physical-device regression T01-T21 is recorded as complete on 20 November 2026. The iPhone model, iOS version and Expo Go version were not recorded; do not infer them.
2. The submitted video should demonstrate the real device workflow and explain the corresponding source code.
3. If camera, GPS, storage, navigation or map code changes after the recorded regression, repeat the affected physical-device tests before submission.
4. The public repository and its README have been checked. Keep the presentation and video aligned with the tested SiteCheck source version.
