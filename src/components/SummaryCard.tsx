import { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '@/constants/theme';

interface SummaryCardProps {
  label: string;
  value: number;
  icon: ComponentProps<typeof Ionicons>['name'];
  accent: string;
}

export function SummaryCard({ label, value, icon, accent }: SummaryCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.icon, { backgroundColor: `${accent}18` }]}>
        <Ionicons name={icon} size={19} color={accent} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  value: { fontSize: 24, fontWeight: '900', color: colors.text },
  label: { fontSize: 13, color: colors.textMuted, fontWeight: '600', marginTop: 2 },
});
