import {
  FacilityType,
  InspectionOutcome,
  ReportSeverity,
  ReportStatus,
} from '@/types/report';
import { colors } from './theme';

export const facilityOptions: { value: FacilityType; label: string }[] = [
  { value: 'lighting', label: 'Lighting' },
  { value: 'bench', label: 'Bench' },
  { value: 'sign', label: 'Sign' },
  { value: 'bin', label: 'Waste bin' },
  { value: 'telecom', label: 'Telecom' },
  { value: 'other', label: 'Other' },
];

export const severityOptions: { value: ReportSeverity; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export const outcomeOptions: { value: InspectionOutcome; label: string }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'attention', label: 'Needs attention' },
  { value: 'fault', label: 'Fault found' },
];

export const statusOptions: { value: ReportStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'resolved', label: 'Resolved' },
];

export const statusMeta: Record<
  ReportStatus,
  { label: string; color: string; background: string }
> = {
  open: { label: 'Open', color: colors.danger, background: colors.dangerSoft },
  in_progress: {
    label: 'In progress',
    color: colors.warning,
    background: colors.warningSoft,
  },
  resolved: {
    label: 'Resolved',
    color: colors.success,
    background: colors.successSoft,
  },
};

export const severityMeta: Record<
  ReportSeverity,
  { label: string; color: string; background: string }
> = {
  low: { label: 'Low', color: colors.info, background: colors.infoSoft },
  medium: { label: 'Medium', color: colors.warning, background: colors.warningSoft },
  high: { label: 'High', color: colors.danger, background: colors.dangerSoft },
};

export const outcomeMeta: Record<
  InspectionOutcome,
  { label: string; color: string; background: string }
> = {
  normal: {
    label: 'Normal',
    color: colors.success,
    background: colors.successSoft,
  },
  attention: {
    label: 'Needs attention',
    color: colors.warning,
    background: colors.warningSoft,
  },
  fault: {
    label: 'Fault found',
    color: colors.danger,
    background: colors.dangerSoft,
  },
};

export function getFacilityLabel(value: FacilityType): string {
  return facilityOptions.find((option) => option.value === value)?.label ?? 'Other';
}
