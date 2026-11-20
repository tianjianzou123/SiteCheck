import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NetworkStateType, useNetworkState } from 'expo-network';
import { colors, radius, spacing } from '@/constants/theme';

export function NetworkStatusBanner() {
  const network = useNetworkState();
  const isChecking = network.isConnected === undefined;
  const isOffline = network.isConnected === false || network.isInternetReachable === false;
  const type = network.type && network.type !== NetworkStateType.UNKNOWN
    ? network.type.toLowerCase().replace('_', ' ')
    : 'network';

  const icon = isChecking ? 'ellipsis-horizontal-circle' : isOffline ? 'cloud-offline' : 'cloud-done';
  const title = isChecking ? 'Checking connection' : isOffline ? 'Offline mode' : 'Online';
  const message = isChecking
    ? 'Local inspections remain available while SiteCheck checks connectivity.'
    : isOffline
      ? 'Inspections still save locally. Street and satellite map tiles may be unavailable.'
      : `Connected by ${type}. Online map tiles are available.`;

  return (
    <View style={[styles.banner, isOffline ? styles.offlineBanner : styles.onlineBanner]}>
      <Ionicons
        name={icon}
        size={20}
        color={isOffline ? colors.warning : colors.success}
      />
      <View style={styles.textBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  onlineBanner: { backgroundColor: colors.successSoft, borderColor: '#A9DDC4' },
  offlineBanner: { backgroundColor: colors.warningSoft, borderColor: '#E6BE78' },
  textBlock: { flex: 1 },
  title: { color: colors.text, fontSize: 13, fontWeight: '800' },
  message: { color: colors.textMuted, fontSize: 11, lineHeight: 16, marginTop: 2 },
});

