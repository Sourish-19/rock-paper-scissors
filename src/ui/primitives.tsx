import React, { createContext, type ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View, type TextStyle, type StyleProp } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from 'expo-router';
import { artwork, type Artwork } from './artwork';
import { localSource } from './preload';

export const CANVAS = { width: 393, height: 852 };
export type Rect = { x: number; y: number; w?: number; h?: number };
export const box = (x: number, y: number, width: number, height: number) => ({ position: 'absolute' as const, left: x, top: y, width, height });

// Canvas px drawn beyond the top and bottom of the design, so backgrounds also fill the status-bar and
// gesture-bar areas on phones while every control stays inside the safe area.
const BLEED = 120;
/** Canvas px between the design's top/bottom edges and the physical screen edges (status bar, gesture bar, fit). */
export const CanvasEdges = createContext({ top: 0, bottom: 0 });

const NATIVE_DRIVER = Platform.OS !== 'web';

/**
 * The app's one entrance animation. Children fade in while easing from a small offset (`from`), once when mounted;
 * re-key it to replay (e.g. per onboarding slide). Positioned as a full-canvas layer, so children keep their
 * canvas coordinates and taps pass through its empty parts. Change `replay` to run it again in place.
 */
export function Enter({ children, from = 'up', delay = 0, duration = 260, distance = 10, replay = 0 }: { children: ReactNode; from?: 'up' | 'down' | 'left' | 'right' | 'scale' | 'fade'; delay?: number; duration?: number; distance?: number; replay?: number }) {
  const [t] = useState(() => new Animated.Value(0));
  useEffect(() => {
    t.setValue(0);   // also replays whenever `replay` changes, without rebuilding the children
    const run = from === 'scale'
      ? Animated.sequence([Animated.delay(delay), Animated.spring(t, { toValue: 1, speed: 16, bounciness: 9, useNativeDriver: NATIVE_DRIVER })])
      : Animated.timing(t, { toValue: 1, delay, duration, easing: Easing.out(Easing.cubic), useNativeDriver: NATIVE_DRIVER });
    run.start();
    return () => run.stop();
  }, [t, from, delay, duration, replay]);
  const offset = (sign: number) => t.interpolate({ inputRange: [0, 1], outputRange: [sign * distance, 0] });
  const transform = from === 'up' ? [{ translateY: offset(1) }] : from === 'down' ? [{ translateY: offset(-1) }]
    : from === 'right' ? [{ translateX: offset(1) }] : from === 'left' ? [{ translateX: offset(-1) }]
    : from === 'scale' ? [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [0.86, 1] }) }] : [];
  const opacity = t.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 1, 1], extrapolate: 'clamp' });
  // pointerEvents as a prop, not a style: an animated layer on web drops a "box-none" style, and this full-canvas
  // layer would then swallow taps meant for buttons underneath it.
  return <Animated.View pointerEvents="box-none" style={[box(0, 0, CANVAS.width, CANVAS.height), { opacity, transform }]}>{children}</Animated.View>;
}

export function GameCanvas({ children, background = 'general/Sky.png', keyboard = false, statusBar = 'light', captureRef }: { children: ReactNode; background?: Artwork | null; keyboard?: boolean; statusBar?: 'light' | 'dark'; /** Attached to the visible screen, for screenshots. */ captureRef?: React.RefObject<View | null> }) {
  const insets = useSafeAreaInsets();
  // Each time the screen comes into view (opened, or returned to with back) its content replays its entrance.
  // Web has no navigator crossfade (the previous screen is hidden at once), so there the whole screen fades in too.
  const [visits, setVisits] = useState(0);
  const [screenFade] = useState(() => new Animated.Value(Platform.OS === 'web' ? 0 : 1));
  useFocusEffect(useCallback(() => {
    setVisits(v => v + 1);
    if (Platform.OS !== 'web') return;
    screenFade.setValue(0);
    const run = Animated.timing(screenFade, { toValue: 1, duration: 220, easing: Easing.out(Easing.quad), useNativeDriver: false });
    run.start();
    return () => run.stop();
  }, [screenFade]));
  const [area, setArea] = useState({ width: 393, height: 852 });
  const content = { width: area.width, height: Math.max(1, area.height - insets.top - insets.bottom) };
  // Fit the whole design, but when the screen's shape is within 4% of it, fill the screen instead: that trims
  // at most ~17 canvas px of edge sky (no controls sit there) rather than leaving thin bars at the sides.
  const fit = Math.min(content.width / CANVAS.width, content.height / CANVAS.height);
  const fill = Math.max(content.width / CANVAS.width, content.height / CANVAS.height);
  const scale = fill / fit <= 1.04 ? fill : fit;
  const frame = { width: CANVAS.width * scale, height: CANVAS.height * scale };
  const frameTop = insets.top + (content.height - frame.height) / 2;
  const edges = { top: frameTop / scale, bottom: (area.height - frameTop - frame.height) / scale };
  return <KeyboardAvoidingView style={styles.viewport} behavior={Platform.OS === 'ios' && keyboard ? 'padding' : undefined}>
    <StatusBar style={statusBar} />
    <View style={styles.available} onLayout={e => setArea(e.nativeEvent.layout)}>
      <Animated.View ref={captureRef} collapsable={false} testID="game-canvas-frame" style={{ opacity: screenFade, position: 'absolute', left: (area.width - frame.width) / 2, top: frameTop, ...frame }}>
        <View testID="game-canvas" style={[styles.canvas, { top: -BLEED * scale, transform: [{ scale }], transformOrigin: 'top left' }]}>
          <View style={styles.design}>
            <CanvasEdges.Provider value={edges}>
              {background && <Backdrop asset={background} />}
              {/* Page transition: the sky stays put while the page's content fades and rises in. */}
              <Enter replay={visits}>{children}</Enter>
            </CanvasEdges.Provider>
          </View>
        </View>
      </Animated.View>
    </View>
  </KeyboardAvoidingView>;
}

/**
 * Moves artwork that stands on the design's bottom edge (towers, podiums) down to the phone's real bottom edge,
 * so it doesn't float above a strip of sky. Limited to small shifts, so tall desktop windows keep the design layout.
 */
export function AnchorBottom({ children }: { children: ReactNode }) {
  const { bottom } = useContext(CanvasEdges);
  // pointerEvents as a prop: web ignores a "box-none" style here, and this full-canvas layer would block buttons.
  return <View pointerEvents="box-none" style={box(0, Math.max(-20, Math.min(40, bottom)), CANVAS.width, CANVAS.height)}>{children}</View>;
}

/** A full-canvas background, mirrored above and below the design so it continues seamlessly into the bleed. */
export function Backdrop({ asset }: { asset: Artwork }) {
  return <>
    <Art asset={asset} x={0} y={-CANVAS.height} w={CANVAS.width} h={CANVAS.height} flipY />
    <Art asset={asset} x={0} y={0} w={CANVAS.width} h={CANVAS.height} />
    <Art asset={asset} x={0} y={CANVAS.height} w={CANVAS.width} h={CANVAS.height} flipY />
  </>;
}

export function Art({ asset, x, y, w, h, rotate = 0, opacity = 1, flip = false, flipY = false, tint, stretch = false }: Rect & { asset: Artwork; rotate?: number; opacity?: number; flip?: boolean; flipY?: boolean; tint?: string; stretch?: boolean }) {
  const item = artwork[asset];
  const width = w ?? (h ? h * item.width / item.height : item.width / 4);
  const height = h ?? width * item.height / item.width;
  return <View style={[box(x,y,width,height), { pointerEvents: 'none' }]}><Image accessible={false} source={localSource(item.source as number)} resizeMode={stretch ? 'stretch' : 'contain'} fadeDuration={0} tintColor={tint} style={{ width, height, opacity, transform: [{ rotate: `${rotate}deg` }, { scaleX: flip ? -1 : 1 }, { scaleY: flipY ? -1 : 1 }] }} /></View>;
}

// Evenly spaced points from -r to r, never further apart than `step`.
const span = (r: number, step: number) => {
  const n = Math.max(1, Math.ceil(2 * r / step));
  return Array.from({ length: n + 1 }, (_, i) => -r + i * 2 * r / n);
};
// Offsets of a square (side 2r) centred on (cx, cy). Shifting the glyph by every offset in a filled square
// dilates it with square corners, which is how the designs' pixel outlines follow each stepped letter.
const square = (r: number, cx: number, cy: number, step: number) => span(r, step).flatMap(dx => span(r, step).map(dy => [cx + dx, cy + dy] as const));

/**
 * Pixel-font text with the designs' hard-edged treatment, back to front:
 * an offset black silhouette (shadowX/shadowY), a square black outline, then the fill.
 * All values are reference-canvas pixels; the canvas transform scales them with everything else.
 */
// Extra stroke added to every outline, on top of the measured design values.
const STROKE_BOOST = 1;

export function Label({ children, x, y, w = 393, h = 35, size = 16, color = '#fff', outline = 1.5, strokeBoost = STROKE_BOOST, outlineColor = '#000', shadow = true, shadowX, shadowY, shadowColor = '#000', letterSpacing, align = 'center', style }: Rect & { children: ReactNode; size?: number; color?: string; outline?: number; strokeBoost?: number; outlineColor?: string; shadow?: boolean; shadowX?: number; shadowY?: number; shadowColor?: string; letterSpacing?: number; align?: TextStyle['textAlign']; style?: StyleProp<TextStyle> }) {
  const textStyle: StyleProp<TextStyle> = [{ fontFamily: 'PressStart2P_400Regular', fontSize: size, lineHeight: size * 1.35, textAlign: align, color, letterSpacing, includeFontPadding: false }, style];
  const stroke = outline > 0 ? outline + strokeBoost : 0;
  // By default the hard shadow is offset down-right by the stroke width; `shadow={false}` turns it off.
  const offsetX = shadow ? shadowX ?? stroke : 0, offsetY = shadow ? shadowY ?? stroke : 0;
  const hasShadow = stroke > 0 || offsetX !== 0 || offsetY !== 0;
  // One font pixel is size/8 canvas px; sampling no coarser than that (1px on web) leaves no gaps in the outline.
  const step = Platform.OS === 'web' ? Math.min(1, size / 8) : Math.max(1, size / 8);
  const layers = hasShadow ? [
    ...square(stroke, 0, 0, step).filter(([dx, dy]) => dx !== 0 || dy !== 0).map(([dx, dy]) => ({ dx, dy, color: outlineColor })),
    ...(offsetX || offsetY ? square(stroke, offsetX, offsetY, step).map(([dx, dy]) => ({ dx, dy, color: shadowColor })) : []),
  ] : [];
  if (Platform.OS === 'web') {
    // A single text node: CSS paints every text-shadow behind the fill, in list order (outline above shadow).
    const textShadow = layers.map(l => `${l.dx}px ${l.dy}px 0 ${l.color}`).join(',');
    // Near-1 opacity draws the label through its own transparency layer, where Chrome cannot use
    // LCD (coloured-fringe) antialiasing; pixel-font edges stay neutral black/white like the artwork.
    return <View style={[box(x, y, w, h), { pointerEvents: 'none', opacity: 0.999 }]}>
      <Text allowFontScaling={false} style={[textStyle, layers.length ? { textShadow } as TextStyle : null]}>{children}</Text>
    </View>;
  }
  // Native text supports a single shadow, so the same offsets are drawn as stacked copies (shadow first).
  return <View style={[box(x, y, w, h), { pointerEvents: 'none' }]}>
    {[...layers].reverse().map((l, i) => <Text allowFontScaling={false} key={i} accessible={false} aria-hidden style={[textStyle, StyleSheet.absoluteFill, { color: l.color, transform: [{ translateX: l.dx }, { translateY: l.dy }] }]}>{children}</Text>)}
    <Text allowFontScaling={false} style={textStyle}>{children}</Text>
  </View>;
}

export function ArtButton({ asset = 'game_mode_screen/button.png', x, y, w, h, title, onPress, disabled, dimDisabled = true, size = 16, accessibilityLabel, children, selected = false }: Rect & { asset?: Artwork; title?: string; onPress: () => void; disabled?: boolean; dimDisabled?: boolean; size?: number; accessibilityLabel?: string; children?: ReactNode; selected?: boolean }) {
  const item = artwork[asset];
  const width = w ?? item.width / 4;
  const height = h ?? width * item.height / item.width;
  // Pressing eases the button 3px down and shades it slightly; releasing springs it back. Busy/disabled: held
  // pushed in and shaded darker, never see-through, drawn as a dark silhouette of the button's own artwork.
  const held = !!disabled && dimDisabled;
  const [press] = useState(() => new Animated.Value(held ? 1 : 0));
  useEffect(() => { Animated.timing(press, { toValue: held ? 1 : 0, duration: 120, useNativeDriver: NATIVE_DRIVER }).start(); }, [press, held]);
  const to = (value: number) => (held ? undefined : () => {
    if (value) Animated.timing(press, { toValue: 1, duration: 70, easing: Easing.out(Easing.quad), useNativeDriver: NATIVE_DRIVER }).start();
    else Animated.spring(press, { toValue: 0, speed: 30, bounciness: 12, useNativeDriver: NATIVE_DRIVER }).start();
  });
  return <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? title} accessibilityState={{ disabled: !!disabled, selected }} disabled={disabled} onPress={onPress} onPressIn={to(1)} onPressOut={to(0)} style={box(x,y,width,height)}>
    <Animated.View style={[box(0, 0, width, height), { transform: [{ translateY: press.interpolate({ inputRange: [0, 1], outputRange: [0, 3] }) }] }]}>
      <Art asset={asset} x={0} y={0} w={width} h={height} />
      {title && <Label x={3} y={(height-size*1.35)/2} w={width-6} h={size*1.7} size={size} outline={1.5}>{title}</Label>}
      {children}
      <Animated.View style={[box(0, 0, width, height), { pointerEvents: 'none', opacity: press.interpolate({ inputRange: [0, 1], outputRange: [0, held ? 1 : 0.47], extrapolate: 'clamp' }) }]}>
        <Art asset={asset} x={0} y={0} w={width} h={height} tint="#000" opacity={0.38} />
      </Animated.View>
    </Animated.View>
  </Pressable>;
}

export function BackButton({ onPress }: { onPress: () => void }) {
  return <ArtButton asset="settings_screen/go_back_button.png" x={27} y={26} w={46} accessibilityLabel="Go back" onPress={onPress} />;
}

export function TextLink({ title, x, y, w, onPress, size = 10, underline = true, align = 'center' }: Rect & { title: string; onPress: () => void; size?: number; underline?: boolean; align?: TextStyle['textAlign'] }) {
  const lines = title.split('\n');
  const width = w ?? 300, lineHeight = size * 1.35;
  return <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={box(x,y,width,Math.max(32,lines.length*size*1.6+10))}>
    <Label x={0} y={5} w={width} h={lines.length*size*1.6+4} size={size} align={align}>{title}</Label>
    {/* The designs' underline: a thin white line inside a 3px black band, once per line (pixel font is monospaced). */}
    {underline && lines.map((line, i) => {
      const textWidth = line.length * size;
      const left = align === 'right' ? width - textWidth : align === 'left' ? 0 : (width - textWidth) / 2;
      return <View key={i} style={[box(left - 1.5, 5 + i * lineHeight + 1.175 * size, textWidth + 3, 3), { backgroundColor: '#000', pointerEvents: 'none' }]}>
        <View style={[box(1.5, 1.25, textWidth, 0.5), { backgroundColor: '#fff' }]} />
      </View>;
    })}
  </Pressable>;
}

/** The design's pixel text cursor; blinks while `active`. */
export function Blinker({ x, y, active, height = 18.25 }: { x: number; y: number; active: boolean; height?: number }) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setOn(v => !v), 530);
    return () => { clearInterval(timer); setOn(true); };
  }, [active]);
  return active && on ? <Art asset="authentiction_screen/custom_cursor.png" x={x} y={y} h={height} /> : null;
}

const INPUT_FONT = 13, INPUT_LEFT = 27, INPUT_TOP = 27;
// Text of the real (invisible) input fields. Android treats a fully transparent colour as "unset" and draws the
// typed text anyway, doubling it under the pixel-font copy, so use an alpha that is invisible but not zero.
export const HIDDEN_INPUT_TEXT = 'rgba(255,255,255,0.01)';
// Highlight for selected text, drawn by the real input over the pixel text (its own text stays invisible).
export const SELECTION_COLOR = 'rgba(41,165,255,0.45)';
/** Props for the real input under custom pixel text: no autofill highlight, no caret drawing. */
export const hiddenInputProps = { caretHidden: true, importantForAutofill: 'no', selectionColor: SELECTION_COLOR, spellCheck: false } as const;

type EditableProps = {
  label: string; value: string; onChangeText: (v: string) => void;
  /** Left edge (align="left") or the left of the centring area (align="center"), in canvas px. */
  x: number; y: number; width: number; size: number; align?: 'left' | 'center';
  color?: string; outline?: number; shadow?: boolean; fit?: boolean; upper?: boolean;
  /** Left-aligned fields slide sideways when text is long; false keeps the text (and any prefix) fixed in place. */
  slide?: boolean;
  /** Fixed text shown before the value in the same style (not editable), centred together with it. */
  prefix?: string; secure?: boolean; email?: boolean; numeric?: boolean;
  maxLength?: number; autoFocus?: boolean; autoCapitalize?: 'none' | 'characters' | 'words';
  onSubmitEditing?: () => void; onFocusChange?: (focused: boolean) => void; focusRef?: React.RefObject<TextInput | null>;
  /** Extra touch height above and below the text line, so taps anywhere in the surrounding box reach the input. */
  hitExtra?: number;
};

/**
 * Editable pixel-font text, shared by every text field. The real input sits exactly over the visible text in the
 * same monospaced font and size, so the native caret, selection and drag handles line up with the letters. The
 * pixel cursor follows the caret, in its own padded slot (letters after it step aside) so it never covers a letter.
 * Left-aligned fields slide: long text keeps its size and scrolls sideways inside the field to keep the caret in
 * view. The real input is as wide as the whole text and slides with it, so it never scrolls by itself (which
 * couldn't be tracked) and stays aligned. `fit` instead shrinks long text to fit.
 */
export function PixelEditable({ label, value, onChangeText, x, y, width, size: baseSize, align = 'left', color = '#151515', outline = 0, shadow = false, fit = false, upper = false, slide = true, prefix = '',
  secure = false, email = false, numeric = false, maxLength, autoFocus = false, autoCapitalize = 'none', onSubmitEditing, onFocusChange, focusRef, hitExtra = 0 }: EditableProps) {
  const [focused, setFocused] = useState(autoFocus);
  const [selection, setSelection] = useState({ start: value.length, end: value.length });
  const [scroll, setScroll] = useState(0);
  const ownRef = useRef<TextInput>(null);
  const input = focusRef ?? ownRef;
  const caret = Math.min(selection.start, value.length);
  const collapsed = selection.start === selection.end;
  const cursorHeight = baseSize * 1.4;
  // Padding each side of the cursor: a quarter letter, plus the outline thickness for outlined text.
  const pad = (size: number) => size * 0.25 + (outline > 0 ? outline + 1 : 0);
  const slotFor = (size: number) => size * 1.4 * 37 / 73 + 2 * pad(size);   // cursor width plus padding on each side
  const size = fit ? Math.min(baseSize, width / Math.max(value.length + 1, 1), (width - slotFor(baseSize)) / Math.max(value.length, 1)) : baseSize;
  const line = Math.max(size * 1.4, 18.25 * size / 13);
  const reserve = focused && collapsed;
  const slot = reserve ? slotFor(size) : 0;

  // Sliding window (in characters): keep the caret inside it; show the start of the text when not editing.
  const sliding = align === 'left' && !fit && slide;
  const visible = Math.max(1, Math.floor((width - slotFor(size)) / size));
  let first = focused ? scroll : 0;
  if (sliding && focused) {
    const end = collapsed ? caret : Math.min(selection.end, value.length);
    if (caret < first) first = caret;
    if (end > first + visible) first = end - visible;
    first = Math.max(0, Math.min(first, value.length - visible));
  }
  if (sliding && focused && first !== scroll) setScroll(first);   // derived state: settles within this render
  const CLIP = Math.max(4, hitExtra);   // vertical room inside the clipped window (horizontally it clips exactly at the text edges)
  const ox = sliding ? -first * size : 0, oy = sliding ? CLIP : y;

  const textWidth = (prefix.length + value.length) * size + slot;
  const start = sliding ? ox : align === 'center' ? x + (width - textWidth) / 2 : x;
  const left = start + prefix.length * size;   // where the editable value begins
  const shown = secure ? '*'.repeat(value.length) : upper ? value.toUpperCase() : value;
  const before = shown.slice(0, caret), after = shown.slice(caret);
  const text = (content: string, at: number) => content && (outline > 0
    ? <Label x={at} y={oy + (line - size * 1.35) / 2} w={content.length * size + 8} h={line} size={size} color={color} outline={outline} shadow={shadow} align="left">{content}</Label>
    : <Text allowFontScaling={false} accessible={false} style={[box(at, oy, content.length * size + 4, line), { fontFamily: 'PressStart2P_400Regular', fontSize: size, lineHeight: line, color, includeFontPadding: false, pointerEvents: 'none' }]}>{content}</Text>);
  const setFocus = (next: boolean) => { setFocused(next); onFocusChange?.(next); };
  // A sliding field's real input spans the whole text plus room to type, so it never needs to scroll itself.
  // It also always reaches the far edge of the window, so a tap anywhere along the field lands on it.
  const inputWidth = sliding ? Math.max((value.length + 4) * size + slotFor(size), first * size + width) : Math.max(textWidth - prefix.length * size, size);
  const content = <>
    {/* Web: our own selection highlight on the monospaced grid (phones draw theirs natively, with drag handles). */}
    {Platform.OS === 'web' && focused && !collapsed &&
      <View style={[box(left + selection.start * size, oy, (Math.min(selection.end, value.length) - selection.start) * size, line), { backgroundColor: SELECTION_COLOR, pointerEvents: 'none' }]} />}
    {text(prefix, start)}
    {reserve ? <>{text(before, left)}{text(after, left + caret * size + slot)}</> : text(shown, left)}
    <Blinker x={left + caret * size + pad(size)} y={oy + (line - cursorHeight * size / baseSize) / 2} height={cursorHeight * size / baseSize} active={reserve} />
    {/* The email keyboard on phones only: on web an email-type field hides its caret position, so it stays plain text. */}
    <TextInput ref={input} allowFontScaling={false} {...hiddenInputProps} accessibilityLabel={label} value={value}
      // Move the caret with each edit right away (the platform's selection event can lag behind typing on web).
      onChangeText={next => { const typed = next.length - (value.length - (selection.end - selection.start)); const at = Math.max(0, Math.min(next.length, selection.start + typed)); setSelection({ start: at, end: at }); onChangeText(next); }}
      onSelectionChange={e => setSelection(e.nativeEvent.selection)}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)} onSubmitEditing={onSubmitEditing}
      secureTextEntry={secure} inputMode={numeric ? 'numeric' : email && Platform.OS !== 'web' ? 'email' : 'text'} autoComplete={email ? 'email' : 'off'}
      autoCapitalize={autoCapitalize} autoCorrect={false} maxLength={maxLength} autoFocus={autoFocus}
      style={[box(left, oy - hitExtra, inputWidth, line + 2 * hitExtra), { fontFamily: 'PressStart2P_400Regular', fontSize: size, lineHeight: line, padding: 0, includeFontPadding: false, textAlignVertical: 'center' }, styles.input]} />
  </>;
  return sliding
    ? <View pointerEvents="box-none" style={[box(x, y - CLIP, width, line + 2 * CLIP), { overflow: 'hidden' }]}>{content}</View>
    : content;
}

/** Focuses a field with the caret at the end of its text (used for taps on a field's padding, outside its text). */
export function focusAtEnd(input: TextInput | null, length: number) {
  if (!input) return;
  input.focus();
  // Native inputs expose setSelection; on web the ref is the DOM <input> element.
  const target = input as unknown as { setSelection?: (s: number, e: number) => void; setSelectionRange?: (s: number, e: number) => void };
  setTimeout(() => { target.setSelection?.(length, length); target.setSelectionRange?.(length, length); }, 0);
}

/** The login / sign-up field: the design's input box around a PixelEditable. Taps anywhere on the box focus it. */
export function PixelInput({ label, value, onChangeText, x = 43, y, w = 306.25, error = false, secure = false, email = false, maxLength, autoFocus = false }: Omit<Rect,'x'> & { x?: number; label: string; value: string; onChangeText: (v: string) => void; error?: boolean; secure?: boolean; email?: boolean; maxLength?: number; autoFocus?: boolean }) {
  const input = useRef<TextInput>(null);
  const [revealed, setRevealed] = useState(false);
  // Password fields get the design's show/hide eye at the right of the box; the text stops short of it.
  const EYE_X = 247, textWidth = secure ? EYE_X - INPUT_LEFT - 6 : w - INPUT_LEFT * 2;
  return <View style={box(x,y,w,72.25)}>
    <Art asset="authentiction_screen/PASSWORD TEXT INPUT BOX.png" x={0} y={0} w={w} />
    {error && <Art asset="authentiction_screen/USERNAME TEXT INPUT BOX ERROR STATE.png" x={0} y={0} w={w} />}
    <Pressable accessible={false} onPress={() => focusAtEnd(input.current, value.length)} style={box(0,0,w,72.25)} />
    <PixelEditable focusRef={input} hitExtra={20} label={label} value={value} onChangeText={onChangeText} x={INPUT_LEFT} y={INPUT_TOP} width={textWidth} size={INPUT_FONT}
      secure={secure && !revealed} email={email} maxLength={maxLength} autoFocus={autoFocus} />
    {secure && <Pressable accessibilityRole="button" accessibilityLabel={revealed ? 'Hide password' : 'Show password'} onPress={() => setRevealed(v => !v)} hitSlop={10} style={box(EYE_X - 4, 18, 40, 36)}>
      {/* Open eye while hidden (tap to show); crossed-out eye while visible (tap to hide), centred on the same spot. */}
      {revealed
        ? <Art asset="authentiction_screen/hide_password.png" x={4} y={6} w={31.5} />
        : <Art asset="authentiction_screen/show_password.png" x={4} y={9} w={31.25} />}
    </Pressable>}
  </View>;
}

/** The dark backdrop behind dialogs; it fades in rather than snapping on. */
export function Dimmer() {
  const [t] = useState(() => new Animated.Value(0));
  useEffect(() => { const run = Animated.timing(t, { toValue: 1, duration: 180, useNativeDriver: NATIVE_DRIVER }); run.start(); return () => run.stop(); }, [t]);
  return <Animated.View style={[box(0, -BLEED, CANVAS.width, CANVAS.height + 2 * BLEED), { backgroundColor: 'rgba(0,0,0,0.76)', opacity: t }]} />;
}

export function ArtworkDialog({ asset, onClose, continueButton = false, title, body }: { asset: Artwork; onClose: () => void; continueButton?: boolean; title?: string; body?: string }) {
  return <View accessibilityViewIsModal style={StyleSheet.absoluteFill}>
    <Dimmer />
    <Enter from="scale">
      <Art asset={asset} x={17} y={303} w={362} />
      {title && <View style={[box(80.5,316,235,28), { backgroundColor: '#dc0000' }]}><Label x={0} y={3} w={235} size={14}>{title}</Label></View>}
      {body && <View style={[box(39.5,366,315,62), { backgroundColor: '#ffda00' }]}><Label x={0} y={4} w={315} h={60} size={12}>{body}</Label></View>}
      <ArtButton asset={continueButton ? 'authentiction_screen/continue_button.png' : 'authentiction_screen/ok_button.png'} x={114} y={477} w={168.25} accessibilityLabel={continueButton ? 'Continue' : 'OK'} onPress={onClose} />
    </Enter>
  </View>;
}

export function HeaderDecor({ title, x, y, w, rockX = 5, rockY = 20, paperX = 338, paperY = 44, scissorsX = 80, scissorsY = 99 }: { title: Artwork; x: number; y: number; w?: number; rockX?: number; rockY?: number; paperX?: number; paperY?: number; scissorsX?: number; scissorsY?: number }) {
  return <><Art asset="general/Stone.png" x={rockX} y={rockY} w={84.75} /><Art asset={title} x={x} y={y} w={w} /><Art asset="general/Paper.png" x={paperX} y={paperY} w={48} /><Art asset="general/Scissors.png" x={scissorsX} y={scissorsY} w={48.5} /></>;
}

const styles = StyleSheet.create({
  viewport: { flex: 1, backgroundColor: '#0087ed' },
  available: { flex: 1, overflow: 'hidden' },
  canvas: { position: 'absolute', left: 0, width: 393, height: 852 + 2 * BLEED, overflow: 'hidden', backgroundColor: '#0087ed' },   // the game's blue until a sky has drawn
  design: { position: 'absolute', left: 0, top: BLEED, width: 393, height: 852 },
  input: { color: HIDDEN_INPUT_TEXT, borderWidth: 0, outlineWidth: 0 },
});
