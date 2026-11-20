import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useReports } from '@/hooks/useReports';
import { outcomeMeta, severityMeta, statusMeta } from '@/constants/reportOptions';
import { defaultMapCenter } from '@/constants/map';
import { colors, radius, spacing } from '@/constants/theme';
import { LoadingState } from '@/components/LoadingState';
import { NetworkStatusBanner } from '@/components/NetworkStatusBanner';

interface WebMapReport {
  id: string;
  title: string;
  summary: string;
  color: string;
  latitude: number;
  longitude: number;
  locationSource: string;
}

function safelySerialize(value: unknown): string {
  return JSON.stringify(value)
    .replace(/&/g, '\\u0026')
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e');
}

function createMapHtml(reports: WebMapReport[], center: typeof defaultMapCenter): string {
  const mapData = safelySerialize({ reports, center });

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
    <style>
      html, body, #map { height: 100%; width: 100%; margin: 0; background: #e8eef5; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      .map-message {
        position: absolute; inset: 0; z-index: 1000; display: flex; align-items: center;
        justify-content: center; padding: 32px; color: #627d98; background: #f4f7fa;
        text-align: center; line-height: 1.5;
      }
      .map-message strong { display: block; color: #102a43; font-size: 18px; margin-bottom: 8px; }
      .popup { min-width: 190px; color: #102a43; }
      .popup-title { display: block; font-size: 15px; font-weight: 800; }
      .popup-meta { display: block; margin-top: 4px; color: #627d98; font-size: 12px; }
      .popup-source { display: block; margin-top: 4px; color: #286f9b; font-size: 11px; }
      .popup-button {
        width: 100%; margin-top: 10px; padding: 8px 10px; border: 0; border-radius: 8px;
        color: #ffffff; background: #2f6fed; font-weight: 800;
      }
      .leaflet-control-attribution { font-size: 10px; }
      .leaflet-control-layers { font-size: 12px; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <div id="map-message" class="map-message">Loading street and satellite maps...</div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
    <script>
      (function () {
        var data = ${mapData};
        var message = document.getElementById('map-message');
        var reportMarkers = {};

        function post(payload) {
          if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        }

        function showError(detail) {
          message.innerHTML = '<div><strong>Map unavailable</strong>' + detail + '</div>';
          message.style.display = 'flex';
          post({ type: 'mapError', message: detail });
        }

        function createPopup(report) {
          var container = document.createElement('div');
          container.className = 'popup';

          var title = document.createElement('span');
          title.className = 'popup-title';
          title.textContent = report.title;
          container.appendChild(title);

          var meta = document.createElement('span');
          meta.className = 'popup-meta';
          meta.textContent = report.summary;
          container.appendChild(meta);

          var source = document.createElement('span');
          source.className = 'popup-source';
          source.textContent = report.locationSource;
          container.appendChild(source);

          var button = document.createElement('button');
          button.className = 'popup-button';
          button.textContent = 'Open inspection';
          button.addEventListener('click', function () {
            post({ type: 'openReport', reportId: report.id });
          });
          container.appendChild(button);

          return container;
        }

        try {
          if (!window.L) throw new Error('The map library could not be downloaded. Check the internet connection.');

          var map = L.map('map', { zoomControl: true, attributionControl: true })
            .setView([data.center.latitude, data.center.longitude], data.reports.length ? 16 : 13);

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
          L.control.layers({ 'Street map': street, 'Satellite': satellite }, null, {
            collapsed: false,
            position: 'bottomleft'
          }).addTo(map);

          data.reports.forEach(function (report) {
            var marker = L.circleMarker([report.latitude, report.longitude], {
              radius: 10, color: '#ffffff', weight: 3, fillColor: report.color, fillOpacity: 1
            }).addTo(map);
            marker.bindPopup(createPopup(report));
            reportMarkers[report.id] = marker;
          });

          window.focusReport = function (selectedReportId) {
            var marker = reportMarkers[selectedReportId];
            if (marker) {
              map.setView(marker.getLatLng(), 18, { animate: true });
              marker.openPopup();
            }
          };

          message.style.display = 'none';
          window.siteCheckMapReady = true;
          post({ type: 'mapReady' });
        } catch (error) {
          showError(error && error.message ? error.message : 'Check the internet connection and try again.');
        }
      })();
    </script>
  </body>
</html>`;
}

export default function SiteMapScreen() {
  const { reports, isLoading } = useReports();
  const params = useLocalSearchParams<{ reportId?: string | string[] }>();
  const reportId = Array.isArray(params.reportId) ? params.reportId[0] : params.reportId;
  const webViewRef = useRef<WebView<unknown> | null>(null);
  const [mapWarning, setMapWarning] = useState<string | null>(null);

  const mappedReports = useMemo(
    () => reports.filter((report) => Boolean(report.location)),
    [reports],
  );

  const webMapReports = useMemo<WebMapReport[]>(
    () =>
      mappedReports.map((report) => {
        const isNormal = report.outcome === 'normal';
        return {
          id: report.id,
          title: report.title,
          summary: isNormal
            ? 'Normal inspection'
            : `${outcomeMeta[report.outcome].label} · ${statusMeta[report.status].label} · ${severityMeta[report.severity].label}`,
          color: isNormal ? outcomeMeta.normal.color : statusMeta[report.status].color,
          latitude: report.location!.latitude,
          longitude: report.location!.longitude,
          locationSource: {
            gps: 'Current GPS capture',
            manual_adjustment: 'GPS point adjusted on map',
            manual_map: 'Manually selected map position',
            legacy_gps: 'Imported legacy GPS position',
          }[report.location!.source],
        };
      }),
    [mappedReports],
  );

  const center = useMemo(
    () => mappedReports[0]?.location ?? defaultMapCenter,
    [mappedReports],
  );

  const mapHtml = useMemo(
    () => createMapHtml(webMapReports, center),
    [center, webMapReports],
  );

  const focusReport = useCallback(() => {
    if (!reportId) return;
    webViewRef.current?.injectJavaScript(
      `if (window.siteCheckMapReady) { window.focusReport(${safelySerialize(reportId)}); } true;`,
    );
  }, [reportId]);

  useEffect(() => {
    focusReport();
  }, [focusReport]);

  const handleMapMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as {
        type?: string;
        reportId?: string;
        message?: string;
      };

      if (message.type === 'openReport' && message.reportId) {
        router.push({ pathname: '/report/[id]', params: { id: message.reportId } });
      } else if (message.type === 'mapError') {
        setMapWarning(message.message ?? 'Map content could not be loaded.');
      } else if (message.type === 'tileWarning') {
        setMapWarning('Map tiles need an internet connection. Saved inspections remain available offline.');
      } else if (message.type === 'mapReady') {
        setMapWarning(null);
        focusReport();
      }
    } catch {
      setMapWarning('The map returned an unexpected response.');
    }
  };

  if (isLoading) return <LoadingState label="Loading mapped inspections..." />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <WebView<unknown>
        ref={webViewRef}
        style={styles.map}
        source={{ html: mapHtml }}
        originWhitelist={['https://*', 'about:*']}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess={false}
        setSupportMultipleWindows={false}
        onLoadEnd={focusReport}
        onMessage={handleMapMessage}
        onError={() => setMapWarning('Map content could not be opened. Check the internet connection.')}
        accessibilityLabel="Interactive facility inspection map"
      />

      <View style={styles.topStack} pointerEvents="none">
        <NetworkStatusBanner />
        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={19} color={colors.info} />
          <Text style={styles.infoText}>
            Green marks normal inspections; issue markers follow their Open, In progress or Resolved status.
          </Text>
        </View>
        {mapWarning ? (
          <View style={styles.warningCard}>
            <Ionicons name="cloud-offline-outline" size={18} color={colors.warning} />
            <Text style={styles.warningText}>{mapWarning}</Text>
          </View>
        ) : null}
      </View>

      {mappedReports.length === 0 ? (
        <View style={styles.emptyCard} pointerEvents="none">
          <Text style={styles.emptyTitle}>No mapped inspections</Text>
          <Text style={styles.emptyText}>Create an inspection and capture its GPS position to show it here.</Text>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  map: { flex: 1, backgroundColor: colors.background },
  topStack: { position: 'absolute', top: spacing.md, left: spacing.md, right: spacing.md, gap: spacing.sm },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoText: { flex: 1, color: colors.textMuted, fontSize: 12, lineHeight: 17 },
  warningCard: {
    backgroundColor: 'rgba(255,250,235,0.97)',
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  warningText: { flex: 1, color: colors.text, fontSize: 12, lineHeight: 17 },
  emptyCard: {
    position: 'absolute',
    top: '48%',
    left: spacing.xl,
    right: spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyTitle: { color: colors.text, fontWeight: '800', fontSize: 17 },
  emptyText: { color: colors.textMuted, textAlign: 'center', marginTop: 5, lineHeight: 19 },
});

