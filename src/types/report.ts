export type FacilityType =
  | 'lighting'
  | 'bench'
  | 'sign'
  | 'bin'
  | 'telecom'
  | 'other';

export type ReportSeverity = 'low' | 'medium' | 'high';
export type ReportStatus = 'open' | 'in_progress' | 'resolved';
export type InspectionOutcome = 'normal' | 'attention' | 'fault';
export type ChecklistResult = 'pass' | 'fail' | 'not_checked';

export interface ChecklistItem {
  id: string;
  label: string;
  result: ChecklistResult;
}

export interface ReportPhoto {
  uri: string;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  capturedAt: string;
}

export interface ReportLocation {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  capturedAt: string;
  source: 'gps' | 'manual_adjustment' | 'manual_map' | 'legacy_gps';
}

export interface SiteReport {
  id: string;
  title: string;
  facilityType: FacilityType;
  description: string;
  outcome: InspectionOutcome;
  severity: ReportSeverity;
  status: ReportStatus;
  inspectedAt: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  photo: ReportPhoto | null;
  location: ReportLocation | null;
  locationNotes: string;
  checklist: ChecklistItem[];
  schemaVersion: 4;
}

export interface ReportInput {
  title: string;
  facilityType: FacilityType;
  description: string;
  outcome: InspectionOutcome;
  severity: ReportSeverity;
  status: ReportStatus;
  locationNotes: string;
  checklist: ChecklistItem[];
}

export interface DeleteReportResult {
  photoCleanupFailed: boolean;
}
