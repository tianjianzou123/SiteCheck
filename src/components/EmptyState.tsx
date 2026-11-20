import { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/constants/theme';

interface EmptyStateProps {
  icon?: ComponentProps<typeof Ionicons>['name'];
  title: string;
  message: string;
}

export function EmptyState({ icon = 'clipboard-outline', title, message }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={42} color={colors.textMuted} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 44, paddingHorizontal: spacing.xl },
  title: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  message: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
