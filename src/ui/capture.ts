import type { RefObject } from 'react';
import { Platform, type View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';

/**
 * Screenshots of the game screen for sharing. A capture is a PNG: a temporary file on phones, a data URI on web.
 */
export async function captureScreen(ref: RefObject<View | null>) {
  if (!ref.current) throw new Error('Nothing to capture');
  return captureRef(ref, { format: 'png', quality: 1, result: Platform.OS === 'web' ? 'data-uri' : 'tmpfile' });
}

const FILE_NAME = 'rock-paper-scissors-result.png';

function download(uri: string) {
  const link = document.createElement('a');
  link.href = uri;
  link.download = FILE_NAME;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function webFile(uri: string) {
  const blob = await (await fetch(uri)).blob();
  return new File([blob], FILE_NAME, { type: 'image/png' });
}

/** Saves the picture to the phone's gallery (asking permission first), or downloads it on web. */
export async function saveImage(uri: string) {
  if (Platform.OS === 'web') { download(uri); return 'DOWNLOADED'; }
  const { granted } = await MediaLibrary.requestPermissionsAsync(true);
  if (!granted) throw new Error('Gallery permission denied');
  await MediaLibrary.saveToLibraryAsync(uri);
  return 'SAVED TO GALLERY';
}

/** Sends the picture through the phone's share menu (any app); on web uses the browser's share, else downloads. */
export async function shareImage(uri: string, text: string) {
  if (Platform.OS === 'web') {
    const file = await webFile(uri);
    const data = { files: [file], text } as ShareData;
    if (navigator.canShare?.(data)) { await navigator.share(data); return; }
    download(uri);
    return;
  }
  if (!(await Sharing.isAvailableAsync())) throw new Error('Sharing unavailable');
  await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: text, UTI: 'public.png' });
}
