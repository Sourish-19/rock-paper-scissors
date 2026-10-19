import { Asset } from 'expo-asset';
import { Platform } from 'react-native';
import { artwork } from './artwork';

/**
 * Loads every piece of artwork once, in the background at startup, and keeps a local copy, so screens open with
 * their images already there instead of drawing the sky and boxes a moment late. Phones use the file expo-asset
 * saves on the device (in Expo Go it would otherwise come from the dev server); web keeps an in-memory blob,
 * because the dev server forbids browser caching. Art draws from the local copy once it's ready (see
 * `localSource`) and from the bundled source until then, so a missed preload only means the old behaviour.
 */
const local = new Map<number, string>();
let started = false;
/** Progress, for diagnostics. */
export const preloadStatus = { total: 0, done: 0, ms: 0 };

export function localSource(module: number) {
  const uri = local.get(module);
  return uri ? { uri } : module;
}

export function preloadArtwork() {
  if (started) return;
  started = true;
  // In the order players meet the screens, so each screen's images are usually ready before it opens.
  const order = ['general', 'loading_screen', 'onboarding_screen', 'authentiction_screen', 'gender_screen', 'home_screen', 'game_mode_screen',
    'game_screen', 'online_duel_screen', 'victory_screen_solo_match', 'defeat_screen_solo_match', 'draw_screen_solo_match',
    'victory_defeat_draw_screen_online_duel_match', 'settings_screen', 'share_screen', 'No_Internet_Screen', 'Oops_Screen'];
  const rank = (name: string) => { const i = order.indexOf(name.split('/')[0]); return i < 0 ? order.length : i; };
  const queue = (Object.keys(artwork) as (keyof typeof artwork)[])
    .sort((a, b) => rank(a) - rank(b))
    .map(name => artwork[name].source as number);
  const t0 = Date.now();
  preloadStatus.total = queue.length;
  const load = async (module: number) => {
    try {
      const asset = Asset.fromModule(module);
      if (Platform.OS === 'web') {
        const blob = await (await fetch(asset.uri)).blob();
        local.set(module, URL.createObjectURL(blob));
      } else {
        await asset.downloadAsync();
        if (asset.localUri) local.set(module, asset.localUri);
      }
    } catch { /* this image just loads on first use, as before */ }
    preloadStatus.done++; preloadStatus.ms = Date.now() - t0;
  };
  // Several at a time, but not so many that the first screen's own images are held up.
  const worker = async () => { while (queue.length) await load(queue.shift()!); };
  void Promise.all(Array.from({ length: 8 }, worker));
}
