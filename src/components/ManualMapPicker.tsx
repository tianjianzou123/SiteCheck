import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { ReportLocation } from '@/types/report';
import { defaultMapCenter } from '@/constants/map';
import { colors, radius, spacing } from '@/constants/theme';
import { AppButton } from '@/components/AppButton';
import { NetworkStatusBanner } from '@/components/NetworkStatusBanner';

interface ManualMapPickerProps {
  visible: boolean;
  initialLocation: ReportLocation | null;
  onCancel: () => void;
  onConfirm: (location: ReportLocation) => void;
}

function serialize(value: unknown): string {
  return JSON.stringify(value)
    .replace(/&/g, '\\u0026')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e');
}

function createPickerHtml(initialLocation: ReportLocation | null): string {
  const center = initialLocation ?? defaultMapCenter;
  const data = serialize({ center, initialLocation });

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
    <style>
      html, body, #map { height: 100%; width: 100%; margin: 0; background: #e8eef5; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      .manual-pin {
        width: 26px; height: 26px; border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg); background: #2f6fed; border: 3px solid #fff;
        box-shadow: 0 2px 8px rgba(16,42,67,.38);
      }
      .manual-pin::after {
        content: ''; position: absolute; width: 8px; height: 8px; border-radius: 50%;
        background: #fff; left: 6px; top: 6px;
      }
      .leaflet-control-layers { font-size: 13px; }
      .leaflet-control-attribution { font-size: 9px; }
      .loading {
        position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
        z-index: 1000; color: #627d98; background: #f4f7fa; text-align: center; padding: 28px;
      }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <div id="loading" class="loading">Loading street and satellite maps...</div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
    <script>
      (function () {
        var data = ${data};
        var loading = document.getElementById('loading');
        var marker = null;

        function post(payload) {
          if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        }

        function sendPosition(latlng) {
          post({ type: 'locationSelected', latitude: latlng.lat, longitude: latlng.lng });
        }

        try {
          if (!window.L) throw new Error('Map library unavailable. Check the internet connection.');

          var map = L.map('map', { zoomControl: true, attributionControl: true })
            .setView([data.center.latitude, data.center.longitude], data.initialLocation ? 18 : 14);

          var street = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; OpenStreetMap contributors'
          });
          var satellite = L.tileLayer(
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            { maxZoom: 19, attribution: 'Tiles &copy; Esri' }
          );
          var tileErrors = 0;
          [street, satellite].forEach(function (layer) {
            layer.on('tileerror', function () {
              tileErrors += 1;
              if (tileErrors === 3) post({ type: 'tileWarning' });
            });
          });
          street.addTo(map);
          L.control.layers({ 'Street map': street, 'Satellite': satellite }, null, { collapsed: false }).addTo(map);

          var pinIcon = L.divIcon({ className: '', html: '<div class="manual-pin"></div>', iconSize: [26, 26], iconAnchor: [13, 26] });

          function placeMarker(latlng, notify) {
            if (marker) {
              marker.setLatLng(latlng);
            } else {
              marker = L.marker(latlng, { draggable: true, icon: pinIcon }).addTo(map);
              marker.on('dragend', function () { sendPosition(marker.getLatLng()); });
            }
            if (notify) sendPosition(marker.getLatLng());
          }

          if (data.initialLocation) {
            placeMarker([data.initialLocation.latitude, data.initialLocation.longitude], false);
          }

          map.on('click', function (event) { placeMarker(event.latlng, true); });
          loading.style.display = 'none';
          post({ type: 'mapReady' });
        } catch (error) {
          loading.textContent = error && error.message ? error.message : 'Map unavailable.';
          post({ type: 'mapError', message: loading.textContent });
        }
      })();
    </script>
  </body>
</html>`;
}

export function ManualMapPicker({
  visible,
  initialLocation,
  onCancel,
  onConfirm,
}: ManualMapPickerProps) {
  const [selection, setSelection] = useState<ReportLocation | null>(initialLocation);
  const [warning, setWarning] = useState<string | null>(null);

  const html = useMemo(() => createPickerHtml(initialLocation), [initialLocation]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as {
        type?: string;
        latitude?: number;
        longitude?: number;
        message?: string;
      };
      if (
        message.type === 'locationSelected' &&
        typeof message.latitude === 'number' &&
        typeof message.longitude === 'number'
      ) {
        setSelection({
          latitude: message.latitude,
          longitude: message.longitude,
          accuracy: null,
          capturedAt: new Date().toISOString(),
          source: 'manual_map',
        });
        setWarning(null);
      } else if (message.type === 'tileWarning') {
        setWarning('Some map tiles could not load. Check the connection and try another zoom level.');
      } else if (message.type === 'mapError') {
        setWarning(message.message ?? 'Map content could not be loaded.');
      }
    } catch {
      setWarning('The map returned an unexpected response.');
    }
  };

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen" onRequestClose={onCancel}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close map picker" onPress={onCancel}>
            <Ionicons name="close" size={27} color={colors.text} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>Fine-tune facility marker</Text>
            <Text style={styles.subtitle}>Check the GPS point, then tap or drag to correct it if needed.</Text>
          </View>
        </View>

        <View style={styles.networkWrap}>
          <NetworkStatusBanner />
        </View>

        <WebView
          style={styles.map}
          source={{ html }}
          originWhitelist={['https://*', 'about:*']}
          javaScriptEnabled
          domStorageEnabled
          allowFileAccess={false}
          setSupportMultipleWindows={false}
          onMessage={handleMessage}
          onError={() => setWarning('Map content could not be opened. Check the internet connection.')}
          accessibilityLabel="Facility location adjustment map"
        />

        <View style={styles.footer}>
          {warning ? (
            <View style={styles.warning}>
              <Ionicons name="warning-outline" size={18} color={colors.warning} />
              <Text style={styles.warningText}>{warning}</Text>
            </View>
          ) : null}
          <View style={styles.coordinateBox}>
            <Ionicons name="pin" size={22} color={selection ? colors.primary : colors.textMuted} />
            <View style={styles.coordinateText}>
              <Text style={styles.coordinateLabel}>{selection ? 'Selected position' : 'No position selected'}</Text>
              <Text style={styles.coordinateValue}>
                {selection
                  ? `${selection.latitude.toFixed(6)}, ${selection.longitude.toFixed(6)}`
                  : 'Tap the map to place a marker.'}
              </Text>
            </View>
          </View>
          <View style={styles.actions}>
            <AppButton label="Cancel" variant="ghost" onPress={onCancel} style={styles.action} />
            <AppButton
              label="Use this marker"
              icon="checkmark-circle-outline"
              onPress={() => selection && onConfirm(selection)}
              disabled={!selection}
              style={styles.action}
            />
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  header: {
    minHeight: 68,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerText: { flex: 1 },
  title: { color: colors.text, fontSize: 18, fontWeight: '900' },
  subtitle: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  networkWrap: { padding: spacing.sm, backgroundColor: colors.background },
  map: { flex: 1, backgroundColor: colors.background },
  footer: { padding: spacing.md, gap: spacing.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border },
  warning: { flexDirection: 'row', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.warningSoft },
  warningText: { flex: 1, color: colors.text, fontSize: 11, lineHeight: 16 },
  coordinateBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  coordinateText: { flex: 1 },
  coordinateLabel: { color: colors.text, fontSize: 13, fontWeight: '800' },
  coordinateValue: { color: colors.textMuted, fontSize: 12, marginTop: 2, fontVariant: ['tabular-nums'] },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
});

