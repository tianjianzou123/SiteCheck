import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useReports } from '@/hooks/useReports';
import {
  ChecklistItem,
  FacilityType,
  InspectionOutcome,
  ReportLocation,
  ReportPhoto,
  ReportSeverity,
  ReportStatus,
  SiteReport,
} from '@/types/report';
import { colors, radius, spacing } from '@/constants/theme';
import {
  facilityOptions,
  outcomeOptions,
  severityOptions,
  statusOptions,
} from '@/constants/reportOptions';
import { createChecklist } from '@/constants/checklistTemplates';
import { formatDateTime, generateReportId, validateReportInput } from '@/utils/reportUtils';
import { persistPhoto, removeManagedPhoto } from '@/services/photoStorage';
import { captureCurrentLocation } from '@/services/locationService';
import { ChoiceChips } from '@/components/ChoiceChips';
import { FormField } from '@/components/FormField';
import { ChecklistEditor } from '@/components/ChecklistEditor';
import { AppButton } from '@/components/AppButton';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { ManualMapPicker } from '@/components/ManualMapPicker';

export default function ReportFormScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const editId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { getReport, createReport, updateReport, isLoading } = useReports();
  const existing = editId ? getReport(editId) : undefined;
  const [reportId, setReportId] = useState(() => editId ?? generateReportId());
  const hydratedIdRef = useRef<string | null>(null);

  const [title, setTitle] = useState('');
  const [facilityType, setFacilityType] = useState<FacilityType>('lighting');
  const [description, setDescription] = useState('');
  const [inspectedAt, setInspectedAt] = useState(() => new Date().toISOString());
  const [outcome, setOutcome] = useState<InspectionOutcome>('normal');
  const [severity, setSeverity] = useState<ReportSeverity>('low');
  const [status, setStatus] = useState<ReportStatus>('resolved');
  const [locationNotes, setLocationNotes] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(() => createChecklist('lighting'));
  const [photo, setPhoto] = useState<ReportPhoto | null>(null);
  const [location, setLocation] = useState<ReportLocation | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isTakingPhoto, setIsTakingPhoto] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isMapPickerVisible, setIsMapPickerVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!existing || hydratedIdRef.current === existing.id) return;
    hydratedIdRef.current = existing.id;
    setReportId(existing.id);
    setTitle(existing.title);
    setFacilityType(existing.facilityType);
    setDescription(existing.description);
    setInspectedAt(existing.inspectedAt);
    setOutcome(existing.outcome);
    setSeverity(existing.severity);
    setStatus(existing.status);
    setLocationNotes(existing.locationNotes);
    setChecklist(existing.checklist);
    setPhoto(existing.photo);
    setLocation(existing.location);
  }, [existing]);

  const isEditing = Boolean(editId);
  const pageTitle = isEditing ? 'Edit inspection' : 'New inspection';
  const hasNewPhoto = Boolean(photo && photo.uri !== existing?.photo?.uri);

  const locationSummary = useMemo(() => {
    if (!location) return 'No location captured';
    const method = {
      gps: 'Current GPS capture',
      manual_adjustment: 'GPS point adjusted on map',
      manual_map: 'Manual map pin',
      legacy_gps: 'Imported legacy GPS point',
    }[location.source];
    const accuracy =
      location.accuracy === null ? '' : ` · accuracy ±${Math.round(location.accuracy)} m`;
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)} · ${method}${accuracy}`;
  }, [location]);

  const changeFacilityType = (nextType: FacilityType) => {
    setFacilityType(nextType);
    setChecklist(createChecklist(nextType));
  };

  const changeOutcome = (nextOutcome: InspectionOutcome) => {
    const wasNormal = outcome === 'normal';
    setOutcome(nextOutcome);

    if (nextOutcome === 'normal') {
      setSeverity('low');
      setStatus('resolved');
    } else if (wasNormal) {
      setSeverity(nextOutcome === 'fault' ? 'high' : 'medium');
      setStatus('open');
    }
  };

  const takePhoto = async () => {
    setIsTakingPhoto(true);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          'Camera permission required',
          'SiteCheck needs camera access to attach required inspection evidence. Enable camera access in Settings, then retry before saving.',
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.75,
      });
      if (result.canceled || !result.assets[0]) return;

      const asset = result.assets[0];
      setPhoto({
        uri: asset.uri,
        mimeType: asset.mimeType ?? null,
        width: asset.width ?? null,
        height: asset.height ?? null,
        capturedAt: new Date().toISOString(),
      });
      setErrors((current) => ({ ...current, photo: '' }));
    } catch (cause) {
      Alert.alert('Camera error', cause instanceof Error ? cause.message : 'The photo could not be captured.');
    } finally {
      setIsTakingPhoto(false);
    }
  };

  const getCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const result = await captureCurrentLocation();
      if (!result.ok) {
        Alert.alert(result.title, result.message);
        return;
      }

      setLocation(result.location);
      setErrors((current) => ({ ...current, location: '' }));
      if (result.isApproximate) {
        Alert.alert(
          'Approximate location captured',
          'Your iPhone is sharing an approximate position. You can enable Precise Location in Settings or fine-tune the marker on the map.',
        );
      }
    } finally {
      setIsLocating(false);
    }
  };

  const confirmManualLocation = (selected: ReportLocation) => {
    const isUnchanged =
      location !== null &&
      selected.latitude === location.latitude &&
      selected.longitude === location.longitude;
    if (isUnchanged) {
      setIsMapPickerVisible(false);
      return;
    }

    const wasGpsBased = location?.source === 'gps' || location?.source === 'manual_adjustment';
    setLocation({
      ...selected,
      accuracy: null,
      capturedAt: new Date().toISOString(),
      source: wasGpsBased ? 'manual_adjustment' : 'manual_map',
    });
    setErrors((current) => ({ ...current, location: '' }));
    setIsMapPickerVisible(false);
  };

  const save = async () => {
    const input = {
      title,
      facilityType,
      description,
      outcome,
      severity,
      status,
      locationNotes,
      checklist,
    };
    const nextErrors = validateReportInput(input);
    if (!photo) nextErrors.photo = 'Take a site photo before saving.';
    if (!location) nextErrors.location = 'Capture GPS or place a marker on the site map.';
    if (!locationNotes.trim()) nextErrors.locationNotes = 'Enter a clear description of this location.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      Alert.alert('Check the form', 'Complete the highlighted fields before saving.');
      return;
    }

    setIsSaving(true);
    let newlyPersistedPhoto: ReportPhoto | null = null;
    try {
      if (photo && hasNewPhoto) {
        newlyPersistedPhoto = await persistPhoto(photo.uri, reportId, {
          mimeType: photo.mimeType,
          width: photo.width,
          height: photo.height,
        });
      }

      const now = new Date().toISOString();
      const savedStatus: ReportStatus = outcome === 'normal' ? 'resolved' : status;
      const savedSeverity: ReportSeverity = outcome === 'normal' ? 'low' : severity;
      const resolvedAt =
        savedStatus === 'resolved'
          ? existing?.status === 'resolved'
            ? existing.resolvedAt ?? now
            : now
          : null;

      const report: SiteReport = {
        id: reportId,
        title: title.trim(),
        facilityType,
        description: description.trim(),
        outcome,
        severity: savedSeverity,
        status: savedStatus,
        inspectedAt,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        resolvedAt,
        photo: newlyPersistedPhoto ?? photo,
        location,
        locationNotes: locationNotes.trim(),
        checklist,
        schemaVersion: 4,
      };

      if (existing) {
        await updateReport(report);
      } else {
        await createReport(report);
      }

      if (newlyPersistedPhoto && existing?.photo?.uri) {
        try {
          removeManagedPhoto(existing.photo.uri);
        } catch {
          Alert.alert('Inspection saved', 'The old photo could not be cleaned up, but the inspection was updated.');
        }
      }
      router.replace({ pathname: '/report/[id]', params: { id: report.id } });
    } catch (cause) {
      if (newlyPersistedPhoto) {
        try {
          removeManagedPhoto(newlyPersistedPhoto.uri);
        } catch {
          // The report save error is the actionable error shown to the user.
        }
      }
      Alert.alert('Unable to save inspection', cause instanceof Error ? cause.message : 'Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && isEditing) return <LoadingState label="Loading inspection..." />;
  if (isEditing && !existing) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Stack.Screen options={{ title: 'Inspection unavailable' }} />
        <EmptyState title="Inspection not found" message="It may have been deleted from this device." />
        <AppButton label="Return to dashboard" onPress={() => router.replace('/')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <Stack.Screen options={{ title: pageTitle }} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.introCard}>
            <View style={styles.introIcon}>
              <Ionicons name="clipboard" size={25} color={colors.primary} />
            </View>
            <View style={styles.flex}>
              <Text style={styles.introTitle}>{pageTitle}</Text>
              <Text style={styles.introText}>Inspection ID: {reportId}</Text>
              <Text style={styles.introText}>Inspection time: {formatDateTime(inspectedAt)}</Text>
            </View>
          </View>

          <Section title="Inspection information" />
          <FormField
            label="Inspection title *"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Routine check – crossing light near The Hub"
            maxLength={80}
            error={errors.title}
          />
          <FormField
            label="Description *"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the facility condition and what you observed."
            multiline
            maxLength={500}
            error={errors.description}
          />

          <FieldLabel label="Facility type" />
          <ChoiceChips choices={facilityOptions} value={facilityType} onChange={changeFacilityType} />

          <FieldLabel label="Inspection outcome" />
          <ChoiceChips choices={outcomeOptions} value={outcome} onChange={changeOutcome} />

          {outcome === 'normal' ? (
            <View style={styles.normalNotice}>
              <Ionicons name="checkmark-circle" size={22} color={colors.success} />
              <View style={styles.flex}>
                <Text style={styles.normalNoticeTitle}>No issue follow-up required</Text>
                <Text style={styles.normalNoticeText}>
                  This routine inspection will be recorded as complete. Add an accurate observation and checklist below.
                </Text>
              </View>
            </View>
          ) : (
            <>
              <FieldLabel label="Issue severity" />
              <ChoiceChips choices={severityOptions} value={severity} onChange={setSeverity} />

              <FieldLabel label="Follow-up status" />
              <ChoiceChips choices={statusOptions} value={status} onChange={setStatus} />
            </>
          )}

          <Section title="Site evidence" />
          <View style={styles.evidenceCard}>
            {photo ? (
              <Image source={{ uri: photo.uri }} style={styles.preview} />
            ) : (
              <View style={[styles.preview, styles.previewPlaceholder]}>
                <Ionicons name="camera-outline" size={38} color={colors.textMuted} />
                <Text style={styles.placeholderText}>No site photo captured</Text>
              </View>
            )}
            <AppButton
              label={photo ? 'Retake photo' : 'Take site photo'}
              icon="camera"
              variant="secondary"
              onPress={() => void takePhoto()}
              loading={isTakingPhoto}
            />
            {errors.photo ? <Text style={styles.validationError}>{errors.photo}</Text> : null}
            <Text style={styles.evidenceHint}>
              Required: photograph the facility condition and enough surrounding context to identify it.
            </Text>
          </View>

          <View style={styles.evidenceCard}>
            <View style={styles.locationHeader}>
              <Ionicons name="location" size={24} color={location ? colors.success : colors.textMuted} />
              <View style={styles.flex}>
                <Text style={styles.locationTitle}>Facility location *</Text>
                <Text style={styles.locationValue}>{locationSummary}</Text>
              </View>
            </View>
            <AppButton
              label={location?.source === 'gps' ? 'Refresh current GPS' : 'Capture current GPS'}
              icon="locate"
              onPress={() => void getCurrentLocation()}
              loading={isLocating}
              disabled={isSaving}
            />
            <AppButton
              label={location ? 'Fine-tune marker on map' : 'Choose manually on map'}
              icon="map-outline"
              variant="secondary"
              onPress={() => setIsMapPickerVisible(true)}
              disabled={isLocating || isSaving}
            />
            {errors.location ? <Text style={styles.validationError}>{errors.location}</Text> : null}
            <Text style={styles.evidenceHint}>
              GPS is requested once while this screen is open; SiteCheck does not track you in the background. Use the map to correct the marker or as a fallback.
            </Text>
          </View>

          <FormField
            label="Location description"
            value={locationNotes}
            onChangeText={setLocationNotes}
            placeholder="e.g. North car park, beside building entrance B"
            maxLength={160}
            error={errors.locationNotes}
            hint="Required: identify the building side, path, entrance or nearby landmark."
          />

          <Section title="Inspection checklist" />
          <Text style={styles.sectionHint}>
            Record what was observed for this {facilityOptions.find((item) => item.value === facilityType)?.label.toLowerCase()}.
          </Text>
          <ChecklistEditor items={checklist} onChange={setChecklist} />

          <View style={styles.actions}>
            <AppButton
              label={isEditing ? 'Save changes' : 'Save inspection'}
              icon="save-outline"
              onPress={() => void save()}
              loading={isSaving}
            />
            <AppButton label="Cancel" variant="ghost" onPress={() => router.back()} disabled={isSaving} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      {isMapPickerVisible ? (
        <ManualMapPicker
          visible
          initialLocation={location}
          onCancel={() => setIsMapPickerVisible(false)}
          onConfirm={confirmManualLocation}
        />
      ) : null}
    </SafeAreaView>
  );
}

function Section({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function FieldLabel({ label }: { label: string }) {
  return <Text style={styles.fieldLabel}>{label}</Text>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 48 },
  notFound: { flex: 1, justifyContent: 'center', padding: spacing.xl, backgroundColor: colors.background },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#C5D8FF',
  },
  introIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  introTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },
  introText: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  sectionTitle: { color: colors.navy, fontSize: 19, fontWeight: '900', marginTop: spacing.sm },
  sectionHint: { color: colors.textMuted, fontSize: 13, lineHeight: 18, marginTop: -spacing.md },
  fieldLabel: { color: colors.text, fontSize: 14, fontWeight: '700', marginBottom: -spacing.sm },
  evidenceCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  preview: { width: '100%', height: 210, borderRadius: radius.md, backgroundColor: colors.background },
  previewPlaceholder: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  placeholderText: { color: colors.textMuted, fontSize: 13 },
  locationHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  locationTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  locationValue: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  evidenceHint: { color: colors.textMuted, fontSize: 11, lineHeight: 16 },
  validationError: { color: colors.danger, fontSize: 12, fontWeight: '600' },
  normalNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.successSoft,
    borderWidth: 1,
    borderColor: '#B8E3CF',
  },
  normalNoticeTitle: { color: colors.success, fontSize: 14, fontWeight: '800' },
  normalNoticeText: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 3 },
  actions: { gap: spacing.md, marginTop: spacing.sm },
});
