import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import { EmptyState } from '@/components/EmptyState';
import { AppButton } from '@/components/AppButton';
import { colors, spacing } from '@/constants/theme';

export default function NotFoundScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <EmptyState title="Page not found" message="This SiteCheck screen does not exist." />
      <AppButton label="Return to dashboard" onPress={() => router.replace('/')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: spacing.xl,
  },
});
