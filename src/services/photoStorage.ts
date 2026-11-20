import { Directory, File, Paths } from 'expo-file-system';
import { ReportPhoto } from '@/types/report';

const PHOTO_FOLDER = 'sitecheck/photos';
const photoDirectory = new Directory(Paths.document, PHOTO_FOLDER);

function ensurePhotoDirectory(): void {
  photoDirectory.create({ idempotent: true, intermediates: true });
}

function extensionFrom(sourceUri: string, mimeType?: string | null): string {
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/heic' || mimeType === 'image/heif') return 'heic';
  const cleanUri = sourceUri.split('?')[0];
  const extension = cleanUri.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase();
  return extension && extension.length <= 5 ? extension : 'jpg';
}

export async function persistPhoto(
  sourceUri: string,
  reportId: string,
  metadata: { mimeType?: string | null; width?: number | null; height?: number | null },
): Promise<ReportPhoto> {
  ensurePhotoDirectory();

  const source = new File(sourceUri);
  if (!source.exists) throw new Error('The captured photo file is no longer available.');

  const extension = extensionFrom(sourceUri, metadata.mimeType);
  const destination = new File(photoDirectory, `${reportId}-${Date.now()}.${extension}`);
  await source.copy(destination);

  return {
    uri: destination.uri,
    mimeType: metadata.mimeType ?? source.type ?? null,
    width: metadata.width ?? null,
    height: metadata.height ?? null,
    capturedAt: new Date().toISOString(),
  };
}

export function isManagedPhoto(uri: string): boolean {
  return uri.includes(`/${PHOTO_FOLDER}/`);
}

export function photoExists(uri: string): boolean {
  try {
    return new File(uri).exists;
  } catch {
    return false;
  }
}

export function removeManagedPhoto(uri: string | null | undefined): void {
  if (!uri || !isManagedPhoto(uri)) return;
  const file = new File(uri);
  if (file.exists) file.delete();
}
