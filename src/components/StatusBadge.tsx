import { StyleSheet, Text, View } from 'react-native';
import { InspectionOutcome, ReportSeverity, ReportStatus } from '@/types/report';
import { outcomeMeta, severityMeta, statusMeta } from '@/constants/reportOptions';
import { radius } from '@/constants/theme';

interface StatusBadgeProps {
  outcome?: InspectionOutcome;
  status?: ReportStatus;
  severity?: ReportSeverity;
}

export function StatusBadge({ outcome, status, severity }: StatusBadgeProps) {
  const meta = outcome
    ? outcomeMeta[outcome]
    : status
      ? statusMeta[status]
      : severity
        ? severityMeta[severity]
        : null;
  if (!meta) return null;

  return (
    <View style={[styles.badge, { backgroundColor: meta.background }]}>
      <Text style={[styles.text, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill },
  text: { fontSize: 12, fontWeight: '800' },
});
