import {
  InspectionOutcome,
  ReportInput,
  ReportStatus,
  SiteReport,
} from '@/types/report';

export function generateReportId(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `SC-${timestamp}-${random}`;
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatCoordinate(value: number): string {
  return value.toFixed(6);
}

export function validateReportInput(input: ReportInput): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input.title.trim()) errors.title = 'Enter a short inspection title.';
  if (input.title.trim().length > 80) errors.title = 'Keep the title under 80 characters.';
  if (!input.description.trim()) errors.description = 'Describe what you observed.';
  if (input.description.trim().length < 10) {
    errors.description = 'Add at least 10 characters of useful detail.';
  }
  if (input.locationNotes.trim().length > 160) {
    errors.locationNotes = 'Keep location notes under 160 characters.';
  }
  return errors;
}

export function getStatusCounts(reports: SiteReport[]): Record<'total' | ReportStatus, number> {
  return reports.reduce(
    (counts, report) => {
      counts.total += 1;
      counts[report.status] += 1;
      return counts;
    },
    { total: 0, open: 0, in_progress: 0, resolved: 0 },
  );
}

export function getOutcomeCounts(
  reports: SiteReport[],
): Record<'total' | InspectionOutcome, number> {
  return reports.reduce(
    (counts, report) => {
      counts.total += 1;
      counts[report.outcome] += 1;
      return counts;
    },
    { total: 0, normal: 0, attention: 0, fault: 0 },
  );
}

export function getFollowUpCounts(reports: SiteReport[]): Record<ReportStatus, number> {
  return reports.reduce(
    (counts, report) => {
      if (report.outcome !== 'normal') counts[report.status] += 1;
      return counts;
    },
    { open: 0, in_progress: 0, resolved: 0 },
  );
}

export function sortNewestFirst(reports: SiteReport[]): SiteReport[] {
  return [...reports].sort(
    (a, b) => new Date(b.inspectedAt).getTime() - new Date(a.inspectedAt).getTime(),
  );
}
