import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SiteReport } from '@/types/report';
import { colors, radius, spacing } from '@/constants/theme';
import { formatDateTime } from '@/utils/reportUtils';
import { getFacilityLabel } from '@/constants/reportOptions';
import { photoExists } from '@/services/photoStorage';
import { StatusBadge } from './StatusBadge';

interface ReportCardProps {
  report: SiteReport;
  onPress: () => void;
}

export function ReportCard({ report, onPress }: ReportCardProps) {
  const hasPhoto = Boolean(report.photo?.uri && photoExists(report.photo.uri));

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${report.title}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {hasPhoto ? (
        <Image source={{ uri: report.photo!.uri }} style={styles.photo} />
      ) : (
        <View style={[styles.photo, styles.placeholder]}>
          <Ionicons name="camera-outline" size={25} color={colors.textMuted} />
        </View>
      )}
      <View style={styles.content}>
        <View style={styles.badges}>
          <StatusBadge outcome={report.outcome} />
          {report.outcome !== 'normal' ? <StatusBadge status={report.status} /> : null}
        </View>
        <Text numberOfLines={1} style={styles.title}>
          {report.title}
        </Text>
        <Text style={styles.meta}>{getFacilityLabel(report.facilityType)}</Text>
        <View style={styles.footer}>
          <Ionicons name="time-outline" size={14} color={colors.textMuted} />
          <Text style={styles.date}>{formatDateTime(report.inspectedAt)}</Text>
          {report.location ? (
            <Ionicons name="location" size={15} color={colors.primary} style={styles.locationIcon} />
          ) : null}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={19} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  pressed: { opacity: 0.75 },
  photo: { width: 76, height: 76, borderRadius: radius.md, backgroundColor: colors.background },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, minWidth: 0 },
  badges: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  title: { color: colors.text, fontSize: 16, fontWeight: '800' },
  meta: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  footer: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
  date: { color: colors.textMuted, fontSize: 12, marginLeft: 4 },
  locationIcon: { marginLeft: 'auto' },
});
