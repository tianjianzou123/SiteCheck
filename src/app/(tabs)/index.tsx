import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useReports } from '@/hooks/useReports';
import { InspectionOutcome } from '@/types/report';
import { getFollowUpCounts, getOutcomeCounts } from '@/utils/reportUtils';
import { colors, radius, spacing } from '@/constants/theme';
import { facilityOptions, getFacilityLabel } from '@/constants/reportOptions';
import { SummaryCard } from '@/components/SummaryCard';
import { ReportCard } from '@/components/ReportCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { AppButton } from '@/components/AppButton';
import { NetworkStatusBanner } from '@/components/NetworkStatusBanner';

type OutcomeFilter = 'all' | InspectionOutcome;

const filters: { value: OutcomeFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'normal', label: 'Normal' },
  { value: 'attention', label: 'Attention' },
  { value: 'fault', label: 'Fault' },
];

export default function DashboardScreen() {
  const { reports, isLoading, error, reloadReports } = useReports();
  const [query, setQuery] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>('all');
  const counts = useMemo(() => getOutcomeCounts(reports), [reports]);
  const followUpCounts = useMemo(() => getFollowUpCounts(reports), [reports]);
  const facilityCounts = useMemo(
    () =>
      facilityOptions.map((option) => ({
        ...option,
        count: reports.filter((report) => report.facilityType === option.value).length,
      })),
    [reports],
  );

  const filteredReports = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return reports.filter((report) => {
      const matchesOutcome = outcomeFilter === 'all' || report.outcome === outcomeFilter;
      const matchesSearch =
        !normalized ||
        report.title.toLowerCase().includes(normalized) ||
        report.locationNotes.toLowerCase().includes(normalized) ||
        getFacilityLabel(report.facilityType).toLowerCase().includes(normalized);
      return matchesOutcome && matchesSearch;
    });
  }, [outcomeFilter, query, reports]);

  if (isLoading) return <LoadingState />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <FlatList
        data={filteredReports}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        refreshing={isLoading}
        onRefresh={() => void reloadReports()}
        renderItem={({ item }) => (
          <ReportCard
            report={item}
            onPress={() => router.push({ pathname: '/report/[id]', params: { id: item.id } })}
          />
        )}
        ListHeaderComponent={
          <View>
            <View style={styles.hero}>
              <View style={styles.heroText}>
                <Text style={styles.eyebrow}>OUTDOOR FACILITY INSPECTIONS</Text>
                <Text style={styles.title}>SiteCheck</Text>
                <Text style={styles.subtitle}>
                  Record routine checks and follow up outdoor facility issues from one device.
                </Text>
              </View>
              <View style={styles.heroIcon}>
                <Ionicons name="shield-checkmark" size={30} color={colors.white} />
              </View>
            </View>

            <View style={styles.networkBanner}>
              <NetworkStatusBanner />
            </View>

            {error ? (
              <Pressable onPress={() => void reloadReports()} style={styles.errorBanner}>
                <Ionicons name="warning-outline" size={19} color={colors.danger} />
                <Text style={styles.errorText}>{error} Tap to retry.</Text>
              </Pressable>
            ) : null}

            <View style={styles.summaryGrid}>
              <SummaryCard label="Inspections" value={counts.total} icon="clipboard" accent={colors.primary} />
              <SummaryCard label="Normal" value={counts.normal} icon="checkmark-circle" accent={colors.success} />
              <SummaryCard
                label="Attention"
                value={counts.attention}
                icon="construct"
                accent={colors.warning}
              />
              <SummaryCard
                label="Faults"
                value={counts.fault}
                icon="alert-circle"
                accent={colors.danger}
              />
            </View>

            <View style={styles.followUpCard}>
              <View style={styles.followUpIcon}>
                <Ionicons name="git-compare-outline" size={19} color={colors.primary} />
              </View>
              <View style={styles.heroText}>
                <Text style={styles.followUpTitle}>Issue follow-up</Text>
                <Text style={styles.followUpText}>
                  {followUpCounts.open} open · {followUpCounts.in_progress} in progress · {followUpCounts.resolved} resolved
                </Text>
              </View>
            </View>

            <View style={styles.facilitySection}>
              <Text style={styles.facilityTitle}>Inspections by facility</Text>
              <View style={styles.facilityGrid}>
                {facilityCounts.map((facility) => (
                  <View key={facility.value} style={styles.facilityPill}>
                    <Text style={styles.facilityLabel}>{facility.label}</Text>
                    <Text style={styles.facilityCount}>{facility.count}</Text>
                  </View>
                ))}
              </View>
            </View>

            <AppButton
              label="Create inspection"
              icon="add-circle-outline"
              onPress={() => router.push('/report/form')}
              style={styles.newButton}
            />

            <Text style={styles.sectionTitle}>Recent inspections</Text>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={19} color={colors.textMuted} />
              <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search title, facility or location"
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
                returnKeyType="search"
              />
              {query ? (
                <Pressable onPress={() => setQuery('')} accessibilityLabel="Clear search">
                  <Ionicons name="close-circle" size={19} color={colors.textMuted} />
                </Pressable>
              ) : null}
            </View>
            <View style={styles.filters}>
              {filters.map((filter) => {
                const selected = filter.value === outcomeFilter;
                return (
                  <Pressable
                    key={filter.value}
                    onPress={() => setOutcomeFilter(filter.value)}
                    style={[styles.filter, selected && styles.selectedFilter]}
                  >
                    <Text style={[styles.filterText, selected && styles.selectedFilterText]}>
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.resultCount}>
              {filteredReports.length} {filteredReports.length === 1 ? 'inspection' : 'inspections'}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon={reports.length ? 'search-outline' : 'clipboard-outline'}
            title={reports.length ? 'No matching inspections' : 'No inspections yet'}
            message={
              reports.length
                ? 'Change the search or outcome filter to see more inspections.'
                : 'Record the first routine check or facility issue using a real photo, GPS location and checklist.'
            }
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  hero: {
    backgroundColor: colors.navy,
    borderRadius: radius.lg,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  heroText: { flex: 1 },
  eyebrow: { color: '#A9C4E4', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  title: { color: colors.white, fontSize: 32, fontWeight: '900', marginTop: 5 },
  subtitle: { color: '#D9E6F2', fontSize: 14, lineHeight: 20, marginTop: spacing.sm },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.md,
  },
  errorBanner: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.dangerSoft,
    marginBottom: spacing.lg,
  },
  errorText: { flex: 1, color: colors.danger, fontSize: 13, lineHeight: 18 },
  networkBanner: { marginBottom: spacing.lg },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  facilitySection: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  followUpCard: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#C5D8FF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  followUpIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  followUpTitle: { color: colors.navy, fontSize: 14, fontWeight: '800' },
  followUpText: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
  facilityTitle: { color: colors.text, fontSize: 14, fontWeight: '800', marginBottom: spacing.md },
  facilityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  facilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.pill,
    paddingVertical: 7,
    paddingHorizontal: spacing.md,
  },
  facilityLabel: { color: colors.navy, fontSize: 12, fontWeight: '700' },
  facilityCount: { color: colors.primaryDark, fontSize: 13, fontWeight: '900' },
  newButton: { marginVertical: spacing.lg },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: colors.text, marginBottom: spacing.md },
  searchBox: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.text },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  filter: {
    paddingHorizontal: spacing.md,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  selectedFilter: { backgroundColor: colors.navy, borderColor: colors.navy },
  filterText: { color: colors.textMuted, fontSize: 13, fontWeight: '700' },
  selectedFilterText: { color: colors.white },
  resultCount: { color: colors.textMuted, fontSize: 12, marginVertical: spacing.md },
});
