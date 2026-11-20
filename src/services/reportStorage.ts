import AsyncStorage from '@react-native-async-storage/async-storage';
import { InspectionOutcome, ReportLocation, SiteReport } from '@/types/report';
import { sortNewestFirst } from '@/utils/reportUtils';

const STORAGE_KEY = '@sitecheck/reports/v1';

function normalizeLocation(value: unknown): ReportLocation | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Partial<ReportLocation>;
  if (
    typeof candidate.latitude !== 'number' ||
    !Number.isFinite(candidate.latitude) ||
    typeof candidate.longitude !== 'number' ||
    !Number.isFinite(candidate.longitude)
  ) {
    return null;
  }

  const validSources: ReportLocation['source'][] = [
    'gps',
    'manual_adjustment',
    'manual_map',
    'legacy_gps',
  ];

  return {
    latitude: candidate.latitude,
    longitude: candidate.longitude,
    accuracy: typeof candidate.accuracy === 'number' ? candidate.accuracy : null,
    capturedAt:
      typeof candidate.capturedAt === 'string' ? candidate.capturedAt : new Date(0).toISOString(),
    source:
      candidate.source && validSources.includes(candidate.source)
        ? candidate.source
        : typeof candidate.accuracy === 'number'
          ? 'legacy_gps'
          : 'manual_map',
  };
}

function normalizeReport(value: unknown): SiteReport | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as SiteReport & { voiceNote?: unknown };
  const isValid =
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.description === 'string' &&
    typeof candidate.status === 'string' &&
    Array.isArray(candidate.checklist);

  if (!isValid) return null;

  const { voiceNote: _legacyVoiceNote, ...reportWithoutVoiceNote } = candidate;

  const validOutcomes: InspectionOutcome[] = ['normal', 'attention', 'fault'];
  const failedChecklistItem = candidate.checklist.some((item) => item.result === 'fail');
  const outcome = validOutcomes.includes(candidate.outcome)
    ? candidate.outcome
    : failedChecklistItem
      ? 'fault'
      : candidate.status === 'resolved'
        ? 'normal'
        : 'attention';

  return {
    ...reportWithoutVoiceNote,
    outcome,
    photo: candidate.photo ?? null,
    location: normalizeLocation(candidate.location),
    schemaVersion: 4,
  };
}

export async function loadReports(): Promise<SiteReport[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  const parsed: unknown = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error('Stored inspection data has an unexpected format.');
  }

  return sortNewestFirst(
    parsed.map(normalizeReport).filter((report): report is SiteReport => report !== null),
  );
}

export async function saveReports(reports: SiteReport[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}
