import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useReports } from '@/hooks/useReports';
import { ReportLocation, ReportStatus } from '@/types/report';
import { colors, radius, spacing } from '@/constants/theme';
import { formatCoordinate, formatDateTime } from '@/utils/reportUtils';
import {
  getFacilityLabel,
  outcomeMeta,
  severityMeta,
  statusMeta,
} from '@/constants/reportOptions';
import { photoExists } from '@/services/photoStorage';
import { StatusBadge } from '@/components/StatusBadge';
import { AppButton } from '@/components/AppButton';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';

const nextStatus: Record<ReportStatus, ReportStatus> = {
  open: 'in_progress',
  in_progress: 'resolved',
  resolved: 'open',
};

const locationSourceLabel: Record<ReportLocation['source'], string> = {
  gps: 'Current GPS capture',
  manual_adjustment: 'GPS point adjusted on map',
  manual_map: 'Manually placed map marker',
  legacy_gps: 'Imported legacy GPS capture',
};

export default function ReportDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const { getReport, updateReport, deleteReport, isLoading } = useReports();
  const report = id ? getReport(id) : undefined;

  if (isLoading) return <LoadingState label="Loading inspection..." />;
  if (!report) {
    return (
      <SafeAreaView style={styles.notFound}>
        <EmptyState title="Inspection not found" message="It may have been deleted from this device." />
        <AppButton label="Return to dashboard" onPress={() => router.replace('/')} />
      </SafeAreaView>
    );
  }

  const hasPhoto = Boolean(report.photo?.uri && photoExists(report.photo.uri));

  const changeStatus = async () => {
    const status = nextStatus[report.status];
    const now = new Date().toISOString();
    try {
      await updateReport({
        ...report,
        status,
        updatedAt: now,
        resolvedAt: status === 'resolved' ? now : null,
      });
    } catch (cause) {
      Alert.alert('Status not updated', cause instanceof Error ? cause.message : 'Try again.');
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete this inspection?',
      'The locally stored inspection and photo will be removed. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                const result = await deleteReport(report.id);
                router.replace('/');
                if (result.photoCleanupFailed) {
                  Alert.alert(
                    'Inspection deleted',
                    'The inspection was removed, but its photo file could not be cleaned up.',
                  );
                }
              } catch (cause) {
                Alert.alert('Unable to delete', cause instanceof Error ? cause.message : 'Try again.');
              }
            })();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {hasPhoto ? (
          <Image source={{ uri: report.photo!.uri }} style={styles.heroPhoto} />
        ) : (
          <View style={[styles.heroPhoto, styles.photoPlaceholder]}>
            <Ionicons name="image-outline" size={42} color={colors.textMuted} />
            <Text style={styles.placeholderTitle}>Photo unavailable</Text>
            <Text style={styles.placeholderText}>
              {report.photo ? 'The saved file could not be found.' : 'No photo was attached to this inspection.'}
            </Text>
          </View>
        )}

        <View style={styles.headingBlock}>
          <View style={styles.badges}>
            <StatusBadge outcome={report.outcome} />
            {report.outcome !== 'normal' ? (
              <>
                <StatusBadge status={report.status} />
                <StatusBadge severity={report.severity} />
              </>
            ) : null}
          </View>
          <Text style={styles.title}>{report.title}</Text>
          <Text style={styles.reportId}>{report.id}</Text>
        </View>

        <InfoSection title="Inspection details">
          <InfoRow icon="business-outline" label="Facility" value={getFacilityLabel(report.facilityType)} />
          <InfoRow
            icon="clipboard-outline"
            label="Inspection outcome"
            value={outcomeMeta[report.outcome].label}
          />
          {report.outcome !== 'normal' ? (
            <>
              <InfoRow
                icon="alert-circle-outline"
                label="Issue severity"
                value={severityMeta[report.severity].label}
              />
              <InfoRow
                icon="git-compare-outline"
                label="Follow-up status"
                value={statusMeta[report.status].label}
              />
            </>
          ) : null}
          <InfoRow icon="time-outline" label="Inspected" value={formatDateTime(report.inspectedAt)} />
          <InfoRow icon="refresh-outline" label="Last updated" value={formatDateTime(report.updatedAt)} />
          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionLabel}>Observation</Text>
            <Text style={styles.description}>{report.description}</Text>
          </View>
        </InfoSection>

        <InfoSection title="Location">
          {report.location ? (
            <>
              <InfoRow
                icon="navigate-outline"
                label="Coordinates"
                value={`${formatCoordinate(report.location.latitude)}, ${formatCoordinate(report.location.longitude)}`}
              />
              <InfoRow
                icon="map-outline"
                label="Location method"
                value={locationSourceLabel[report.location.source]}
              />
              {report.location.accuracy !== null ? (
                <InfoRow
                  icon="locate-outline"
                  label="GPS accuracy"
                  value={`±${Math.round(report.location.accuracy)} metres`}
                />
              ) : null}
              <InfoRow
                icon="calendar-outline"
                label="Location recorded"
                value={formatDateTime(report.location.capturedAt)}
              />
              <AppButton
                label="Show on site map"
                icon="map-outline"
                variant="secondary"
                onPress={() =>
                  router.push({ pathname: '/(tabs)/map', params: { reportId: report.id } })
                }
              />
            </>
          ) : (
            <Text style={styles.muted}>No location was saved.</Text>
          )}
          <InfoRow
            icon="location-outline"
            label="Location notes"
            value={report.locationNotes || 'No manual location notes'}
          />
        </InfoSection>

        <InfoSection title="Inspection checklist">
          {report.checklist.map((item) => {
            const icon =
              item.result === 'pass'
                ? 'checkmark-circle'
                : item.result === 'fail'
                  ? 'close-circle'
                  : 'remove-circle';
            const tone =
              item.result === 'pass'
                ? colors.success
                : item.result === 'fail'
                  ? colors.danger
                  : colors.textMuted;
            return (
              <View key={item.id} style={styles.checkItem}>
                <Ionicons name={icon} size={21} color={tone} />
                <Text style={styles.checkLabel}>{item.label}</Text>
                <Text style={[styles.checkResult, { color: tone }]}>
                  {item.result === 'not_checked' ? 'N/A' : item.result.toUpperCase()}
                </Text>
              </View>
            );
          })}
        </InfoSection>

        <InfoSection title="Actions">
          {report.outcome !== 'normal' ? (
            <AppButton
              label={`Move to ${statusMeta[nextStatus[report.status]].label}`}
              icon="git-compare-outline"
              variant="secondary"
              onPress={() => void changeStatus()}
            />
          ) : null}
          <AppButton
            label="Edit inspection"
            icon="create-outline"
            onPress={() => router.push({ pathname: '/report/form', params: { id: report.id } })}
          />
          <AppButton label="Delete inspection" icon="trash-outline" variant="danger" onPress={confirmDelete} />
        </InfoSection>

        <Pressable onPress={() => router.replace('/')} style={styles.dashboardLink}>
          <Ionicons name="arrow-back" size={18} color={colors.primary} />
          <Text style={styles.dashboardLinkText}>Return to dashboard</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: 48, gap: spacing.lg },
  notFound: { flex: 1, justifyContent: 'center', padding: spacing.xl, backgroundColor: colors.background },
  heroPhoto: { width: '100%', height: 250, borderRadius: radius.lg, backgroundColor: colors.surface },
  photoPlaceholder: { alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  placeholderTitle: { color: colors.text, fontSize: 16, fontWeight: '800', marginTop: spacing.sm },
  placeholderText: { color: colors.textMuted, textAlign: 'center', fontSize: 12, marginTop: 4 },
  headingBlock: { gap: spacing.sm },
  badges: { flexDirection: 'row', gap: spacing.sm },
  title: { color: colors.text, fontSize: 27, lineHeight: 34, fontWeight: '900' },
  reportId: { color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  section: { gap: spacing.sm },
  sectionTitle: { color: colors.navy, fontSize: 18, fontWeight: '900' },
  sectionBody: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: { flex: 1 },
  infoLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  infoValue: { color: colors.text, fontSize: 14, fontWeight: '600', marginTop: 2, lineHeight: 20 },
  descriptionBox: { backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.md },
  descriptionLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  description: { color: colors.text, fontSize: 14, lineHeight: 21, marginTop: 5 },
  muted: { color: colors.textMuted, fontSize: 14 },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  checkLabel: { flex: 1, color: colors.text, fontSize: 13, lineHeight: 18 },
  checkResult: { fontSize: 11, fontWeight: '900' },
  dashboardLink: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', justifyContent: 'center' },
  dashboardLinkText: { color: colors.primary, fontSize: 14, fontWeight: '800' },
});
