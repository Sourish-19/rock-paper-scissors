import { Fragment, useEffect, useState } from 'react';
import { Animated, Clipboard, Easing, Linking, Platform, Pressable, Share, View } from 'react-native';
import { ArtButton, box, CANVAS, Dimmer, Label } from './primitives';

type Target = { key: string; label: string; glyph: string; color: string; open: (text: string) => Promise<unknown> | void };

const enc = encodeURIComponent;
// Try the app first, then the web version (e.g. WhatsApp isn't installed, or we're in a browser).
async function openFirst(...urls: string[]) {
  for (const url of urls) {
    try { await Linking.openURL(url); return; } catch { /* try the next one */ }
  }
  throw new Error('No app could open the share link');
}

const TARGETS: Target[] = [
  { key: 'copy', label: 'COPY', glyph: 'CP', color: '#ffffff', open: () => {} },   // handled in the sheet (shows COPIED!)
  { key: 'whatsapp', label: 'WHATSAPP', glyph: 'WA', color: '#25d366', open: t => openFirst(...(Platform.OS === 'web' ? [] : [`whatsapp://send?text=${enc(t)}`]), `https://wa.me/?text=${enc(t)}`) },
  { key: 'x', label: 'X', glyph: 'X', color: '#000000', open: t => openFirst(`https://twitter.com/intent/tweet?text=${enc(t)}`) },
  { key: 'telegram', label: 'TELEGRAM', glyph: 'TG', color: '#29a9eb', open: t => openFirst(...(Platform.OS === 'web' ? [] : [`tg://msg?text=${enc(t)}`]), `https://t.me/share/url?url=${enc(t)}`) },
  { key: 'sms', label: 'MESSAGES', glyph: 'SMS', color: '#34c759', open: t => openFirst(Platform.OS === 'ios' ? `sms:&body=${enc(t)}` : `sms:?body=${enc(t)}`) },
  { key: 'email', label: 'EMAIL', glyph: '@', color: '#ffda00', open: t => openFirst(`mailto:?subject=${enc('Rock Paper Scissors')}&body=${enc(t)}`) },
  { key: 'more', label: 'MORE', glyph: '+', color: '#ffffff', open: t => Share.share({ message: t }) },
];

const SHEET_TOP = 576, SHEET_H = 852 - SHEET_TOP + 120;   // extends below the design so it also covers the gesture bar
const COLS = 4, TILE = 56, GAP_X = (CANVAS.width - 40 - COLS * TILE) / (COLS - 1);

/**
 * A share sheet in the game's pixel style: the screen dims and a panel slides up with a grid of destinations,
 * each opening that app with `message` ready to send. "More" opens the phone's own share menu for anything else.
 */
export function ShareSheet({ message, title = 'SHARE', onClose }: { message: string; title?: string; onClose: () => void }) {
  const [slide] = useState(() => new Animated.Value(0));
  const [note, setNote] = useState('');
  useEffect(() => {
    const run = Animated.spring(slide, { toValue: 1, speed: 14, bounciness: 5, useNativeDriver: Platform.OS !== 'web' });
    run.start();
    return () => run.stop();
  }, [slide]);
  const close = () => {
    Animated.timing(slide, { toValue: 0, duration: 160, easing: Easing.in(Easing.quad), useNativeDriver: Platform.OS !== 'web' }).start(() => onClose());
  };
  const pick = async (target: Target) => {
    if (target.key === 'copy') { Clipboard.setString(message); setNote('COPIED!'); return; }
    try { await target.open(message); close(); }
    catch { setNote(`${target.label} IS NOT AVAILABLE`); }
  };
  return <View accessibilityViewIsModal pointerEvents="box-none" style={box(0, 0, CANVAS.width, CANVAS.height)}>
    <Dimmer />
    {/* Tapping the dimmed area closes the sheet. */}
    <Pressable accessibilityRole="button" accessibilityLabel="Close share sheet" onPress={close} style={box(0, -120, CANVAS.width, SHEET_TOP + 120)} />
    <Animated.View pointerEvents="box-none" style={[box(0, SHEET_TOP, CANVAS.width, SHEET_H), {
      transform: [{ translateY: slide.interpolate({ inputRange: [0, 1], outputRange: [SHEET_H, 0] }) }],
    }]}>
      {/* Pixel panel: black frame, yellow body with a lighter top band, like the game's dialog boxes. */}
      <View style={[box(8, 0, CANVAS.width - 16, SHEET_H), { backgroundColor: '#000' }]} />
      <View style={[box(12, 4, CANVAS.width - 24, SHEET_H), { backgroundColor: '#ffd600' }]} />
      <View style={[box(12, 4, CANVAS.width - 24, 6), { backgroundColor: '#ffe57a' }]} />
      <View style={[box(CANVAS.width / 2 - 24, 14, 48, 5), { backgroundColor: '#000', opacity: 0.35 }]} />
      <Label x={0} y={26} w={CANVAS.width} h={24} size={14} outline={1.5}>{title}</Label>
      {TARGETS.map((target, i) => {
        const col = i % COLS, row = Math.floor(i / COLS);
        const x = 20 + col * (TILE + GAP_X), y = 62 + row * 92;
        return <Fragment key={target.key}>
          <ArtButton asset="game_screen/control_buttons.png" x={x} y={y} w={TILE} accessibilityLabel={`Share to ${target.label}`} onPress={() => { void pick(target); }}>
            <View style={[box(10, 10, TILE - 20, TILE - 20), { backgroundColor: target.color, borderWidth: 2, borderColor: '#000' }]} />
            <Label x={0} y={TILE / 2 - 8} w={TILE} h={18} size={target.glyph.length > 2 ? 9 : 12} color={target.color === '#000000' ? '#fff' : '#000'} outline={target.color === '#000000' ? 1 : 0} shadow={false}>{target.glyph}</Label>
          </ArtButton>
          <Label x={x - 14} y={y + TILE + 5} w={TILE + 28} h={14} size={7} outline={1} strokeBoost={0} shadow={false}>{target.label}</Label>
        </Fragment>;
      })}
      {!!note && <Label x={0} y={252} w={CANVAS.width} h={16} size={9} color="#000" outline={0}>{note}</Label>}
    </Animated.View>
  </View>;
}
