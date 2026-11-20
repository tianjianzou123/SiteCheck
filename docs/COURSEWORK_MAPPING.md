# Coursework requirement mapping

This file maps SiteCheck features to the COMP10013 coursework evidence. It is a checklist, not a claim that unperformed physical-device tests have passed.

| Coursework requirement | SiteCheck implementation | Main source evidence | Verification evidence |
|---|---|---|---|
| React Native mobile app | Expo SDK 58 application with mobile navigation and layouts | `src/app`, `app.json` | iOS production bundle export passed; iPhone Expo Go test pending |
| Full Create operation | Validated form creates either a normal inspection or an issue requiring follow-up | `src/app/report/form.tsx`, `ReportContext.tsx` | Test T06 |
| Full Read operation | Dashboard, map, and details consume stored reports | `src/app/(tabs)/index.tsx`, `map.tsx`, `report/[id].tsx` | Tests T05, T06, T15 |
| Full Update operation | Edit form and direct status transition persist changes | `form.tsx`, `[id].tsx`, `ReportContext.tsx` | Tests T07, T08 |
| Full Delete operation | Confirmation removes the record and managed photo | `[id].tsx`, `ReportContext.tsx`, `photoStorage.ts` | Tests T09, T10 |
| Local persistent storage | Versioned JSON collection saved through AsyncStorage | `reportStorage.ts` | Tests T11, T12 |
| Persistent photos | Camera result copied to document storage; URI stored in report | `photoStorage.ts`, `form.tsx` | Tests T04, T12, T18 |
| Device API 1: Camera | Permission request, real capture, preview, cancellation/error handling | `form.tsx`, `app.json` | Tests T02, T03, T04 |
| Device API 2: GPS | Foreground-only permission, high-accuracy one-shot request, 20-second timeout, approximate-location notice, and error handling | `locationService.ts`, `form.tsx`, `map.tsx`, `app.json` | Tests T13, T14, T15 |
| Map | Saved GPS positions become markers; normal checks are green and issue markers follow workflow status | `src/app/(tabs)/map.tsx` | Tests T15, T16 |
| Business depth | Routine/normal outcomes, facility-specific checklists, fault severity, and issue follow-up workflow | `reportOptions.ts`, `ChecklistEditor.tsx`, `[id].tsx` | Tests T07, T09, T10 |
| React Hooks | State, effects, memoisation, callbacks, context, refs | UI screens and `ReportContext.tsx` | Explain using `TECHNICAL_QA.md` |
| Reusable components | Buttons, fields, chips, cards, badges, checklist, empty/loading states | `src/components` | Code review and demonstration |
| Error handling | Permission refusal, timeout, corrupt storage, missing photo, invalid form, missing record | services and screen alerts/states | Tests T03, T14, T17, T18 |
| GitHub repository | Complete source, README, test plan, and clear structure | repository root | Add remote URL and real commits |
| Real development history | Commit after each genuine milestone | Git history | Student must create/verify commits honestly |
| Phone demonstration | CRUD, persistence, camera, GPS, map, and code explanation | whole app | Part B recording after all tests pass |

## Scope decisions

Included because they add evidence and business value:

- dashboard inspection-outcome statistics and issue follow-up summary
- search and status filtering
- map markers
- GPS marker correction and manual fallback without mislabelling it as GPS
- inspection checklist
- status progression
- persistent photo files
- explicit offline-map limitation

Excluded to keep the project reliable and explainable:

- remote backend or authentication
- background location tracking
- automatic fault detection
- paid maps or cloud services
- chat, notifications, or multi-user assignment
- decorative animation unrelated to the reporting workflow

## Remaining evidence before submission

1. Run every test in `TEST_PLAN.md` on the actual demonstration phone.
2. Record phone/OS/Expo Go versions and actual results.
3. Capture only genuine application screenshots.
4. Add the final GitHub URL to the README and PowerPoint.
5. Confirm the repository is readable by the lecturers.
6. Re-run lint, typecheck, Expo Doctor, and the complete phone regression test after the final code change.

