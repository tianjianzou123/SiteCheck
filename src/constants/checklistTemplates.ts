import { ChecklistItem, FacilityType } from '@/types/report';

const templates: Record<FacilityType, { id: string; label: string }[]> = {
  lighting: [
    { id: 'housing', label: 'Housing and pole are free from visible damage' },
    { id: 'operation', label: 'Light appears operational' },
    { id: 'hazard', label: 'No exposed wiring or immediate safety hazard' },
  ],
  bench: [
    { id: 'structure', label: 'Seat and frame appear structurally stable' },
    { id: 'surface', label: 'No sharp edges or major surface damage' },
    { id: 'fixings', label: 'Ground fixings appear secure' },
  ],
  sign: [
    { id: 'legibility', label: 'Text and symbols are clearly legible' },
    { id: 'structure', label: 'Sign and post appear stable' },
    { id: 'visibility', label: 'Sign is not obscured or vandalised' },
  ],
  bin: [
    { id: 'capacity', label: 'Bin is not overflowing' },
    { id: 'damage', label: 'Container and lid are not damaged' },
    { id: 'surroundings', label: 'Surrounding area is free from waste hazards' },
  ],
  telecom: [
    { id: 'enclosure', label: 'External enclosure is closed and undamaged' },
    { id: 'mounting', label: 'Equipment and mounting appear secure' },
    { id: 'cables', label: 'No exposed or visibly damaged cables' },
  ],
  other: [
    { id: 'condition', label: 'General physical condition is acceptable' },
    { id: 'operation', label: 'Facility appears to operate as expected' },
    { id: 'safety', label: 'No immediate safety hazard is visible' },
  ],
};

export function createChecklist(facilityType: FacilityType): ChecklistItem[] {
  return templates[facilityType].map((item) => ({ ...item, result: 'not_checked' }));
}
