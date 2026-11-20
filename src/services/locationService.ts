import * as Location from 'expo-location';

import { ReportLocation } from '@/types/report';

const LOCATION_TIMEOUT_MS = 20_000;

export type LocationFailureReason =
  | 'permission_denied'
  | 'services_disabled'
  | 'timeout'
  | 'unavailable';

export type LocationCaptureResult =
  | {
      ok: true;
      location: ReportLocation;
      isApproximate: boolean;
    }
  | {
      ok: false;
      reason: LocationFailureReason;
      title: string;
      message: string;
    };

async function getCurrentPositionWithTimeout(): Promise<Location.LocationObject> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('LOCATION_TIMEOUT')), LOCATION_TIMEOUT_MS);
  });

  try {
    return await Promise.race([
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        mayShowUserSettingsDialog: true,
      }),
      timeout,
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export async function captureCurrentLocation(): Promise<LocationCaptureResult> {
  try {
    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      return {
        ok: false,
        reason: 'services_disabled',
        title: 'Location services are off',
        message: 'Turn on Location Services in your phone settings, then try again.',
      };
    }

    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) {
      return {
        ok: false,
        reason: 'permission_denied',
        title: 'Location permission needed',
        message:
          'SiteCheck only requests your location while you are creating an inspection. Enable location access in Settings, or place the marker manually.',
      };
    }

    const position = await getCurrentPositionWithTimeout();

    const capturedAt = Number.isFinite(position.timestamp)
      ? new Date(position.timestamp).toISOString()
      : new Date().toISOString();

    return {
      ok: true,
      isApproximate: permission.ios?.accuracy === 'reduced',
      location: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy:
          typeof position.coords.accuracy === 'number' &&
          Number.isFinite(position.coords.accuracy)
            ? position.coords.accuracy
            : null,
        capturedAt,
        source: 'gps',
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message === 'LOCATION_TIMEOUT') {
      return {
        ok: false,
        reason: 'timeout',
        title: 'Location timed out',
        message:
          'Move to an open area and try again. You can also place the marker manually and explain the location in the notes.',
      };
    }

    return {
      ok: false,
      reason: 'unavailable',
      title: 'Location unavailable',
      message:
        'SiteCheck could not obtain a GPS position. Try again outdoors, or place the marker manually.',
    };
  }
}
