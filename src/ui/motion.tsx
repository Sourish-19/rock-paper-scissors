import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { Animated, Easing, Platform } from 'react-native';
import { Art, box, CANVAS } from './primitives';
import { artwork, type Artwork } from './artwork';

/**
 * A looping hover offset in whole canvas pixels, so floating artwork steps like a retro sprite instead of gliding.
 * `rise` keeps it at or above its designed position (lifting off and settling back); otherwise it bobs ±amplitude.
 */
function useHover({ amplitude, period, phase = 0, rise = false }: { amplitude: number; period: number; phase?: number; rise?: boolean }) {
  const [time] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(time, { toValue: 1, duration: period, easing: Easing.linear, useNativeDriver: Platform.OS !== 'web' }));
    loop.start();
    return () => loop.stop();
  }, [time, period]);
  return useMemo(() => {
    const samples = 48, inputRange: number[] = [], outputRange: number[] = [];
    for (let i = 0; i < samples; i++) {
      const angle = 2 * Math.PI * (i / samples + phase);
      const offset = Math.round(rise ? -amplitude * (1 - Math.cos(angle)) / 2 : amplitude * Math.sin(angle));
      // Hold each value for its whole slice: a step function, not a linear blend between samples.
      inputRange.push(i / samples, (i + 1) / samples - 1e-4);
      outputRange.push(offset, offset);
    }
    return time.interpolate({ inputRange, outputRange, extrapolate: 'clamp' });
  }, [time, amplitude, phase, rise]);
}

/** Moves canvas-positioned artwork by a shared hover offset (see useHover). */
function Hover({ offset, children }: { offset: Animated.AnimatedInterpolation<number>; children: ReactNode }) {
  // Hovering artwork is never tappable: the layer ignores touches entirely, so it can't block buttons under it.
  // (A continuously animated layer on web loses a "box-none" style, so 'none' is the robust choice here.)
  return <Animated.View pointerEvents="none" style={[box(0, 0, CANVAS.width, CANVAS.height), { pointerEvents: 'none', transform: [{ translateY: offset }] }]}>{children}</Animated.View>;
}

/** One falling crumble that lifts off and settles back on its own rhythm. */
function FloatingCrumble({ asset, x, y, w, amplitude, period, phase }: { asset: Artwork; x: number; y: number; w: number; amplitude: number; period: number; phase: number }) {
  const offset = useHover({ amplitude, period, phase, rise: true });
  return <Hover offset={offset}><Art asset={asset} x={x} y={y} w={w} /></Hover>;
}

/** The onboarding island and everything standing on it, hovering gently (a separate component so it can use hooks inside the canvas). */
export function HoveringIsland({ children }: { children: ReactNode }) {
  const offset = useHover({ amplitude: 2, period: 3600 });
  return <Hover offset={offset}>{children}</Hover>;
}

/** Home's island (with its crumbles) and character: one shared hover, split around the front cloud's layer. */
export function HomeIsland({ character }: { character: Artwork }) {
  const island = useHover({ amplitude: 3, period: 3200 });
  return <>
    {/* Back cloud drifts right to left behind the island and character; front cloud drifts left to right in front of the island. */}
    <DriftingCloud asset="home_screen/cloud_2.png" x={267} y={358} w={225} speed={25} direction="left" flip={false} />
    <Hover offset={island}><Art asset="home_screen/floating_island.png" x={47} y={445} w={300} /></Hover>
    {/* Crumbles sit where the complete island artwork has them, each drifting on its own rhythm. */}
    <FloatingCrumble asset="home_screen/floating_island_crumble_3.png" x={82} y={606} w={40} amplitude={6} period={2400} phase={0} />
    <FloatingCrumble asset="home_screen/floating_island_crumble_2.png" x={277} y={595} w={50} amplitude={7} period={3300} phase={0.37} />
    <FloatingCrumble asset="home_screen/floating_island_crumble_1.png" x={122} y={650} w={25} amplitude={5} period={2900} phase={0.71} />
    <Hover offset={island}><Art asset={character} x={136} y={327} h={158} /></Hover>
    <DriftingCloud asset="home_screen/cloud_1.png" x={-198} y={484} w={320} speed={30} flip={false} />
  </>;
}

/**
 * A mirrored cloud drifting horizontally at a constant speed (canvas px per second), forever.
 * It first drifts from its designed position until it has left the canvas, then repeats full passes that
 * start just beyond the opposite edge; the jump between passes happens entirely off-canvas, so it never shows.
 */
export function DriftingCloud({ asset, x, y, w, speed, direction = 'right', flip = true }: { asset: Artwork; x: number; y: number; w: number; speed: number; direction?: 'left' | 'right'; flip?: boolean }) {
  const [offset] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const useNativeDriver = Platform.OS !== 'web';
    // Offsets at which the cloud is fully past the edge it travels towards (exit) / just behind the other edge (enter).
    const exit = direction === 'right' ? CANVAS.width - x : -w - x;
    const enter = direction === 'right' ? -w - x : CANVAS.width - x;
    const drift = (to: number, from: number) => Animated.timing(offset, { toValue: to, duration: Math.abs(to - from) / speed * 1000, easing: Easing.linear, useNativeDriver });
    const animation = Animated.sequence([
      drift(exit, 0),
      Animated.loop(Animated.sequence([
        Animated.timing(offset, { toValue: enter, duration: 0, useNativeDriver }),
        drift(exit, enter),
      ])),
    ]);
    animation.start();
    return () => animation.stop();
  }, [offset, x, w, speed, direction]);
  return <Animated.View style={{ position: 'absolute', left: 0, top: 0, pointerEvents: 'none', transform: [{ translateX: offset }] }}>
    <Art asset={asset} x={x} y={y} w={w} flip={flip} />
  </Animated.View>;
}

/** The paired sky clouds used across screens: a back cloud drifting right and a front cloud drifting left. */
export const BACK_CLOUD = { asset: 'general/cloud_2.png', w: 225, speed: 25 } as const;
export const FRONT_CLOUD = { asset: 'general/cloud_1.png', w: 320, speed: 30 } as const;

/** A back-layer cloud (left to right). Place it right after the background so it passes behind the artwork. */
export function BackCloud({ x = -108, y }: { x?: number; y: number }) {
  return <DriftingCloud asset={BACK_CLOUD.asset} x={x} y={y} w={BACK_CLOUD.w} speed={BACK_CLOUD.speed} />;
}

/** A front-layer cloud (right to left). Place it after the artwork but before buttons, inputs and text. */
export function FrontCloud({ asset = FRONT_CLOUD.asset, x = 302, y, w = FRONT_CLOUD.w, flip = true }: { asset?: Artwork; x?: number; y: number; w?: number; flip?: boolean }) {
  return <DriftingCloud asset={asset} x={x} y={y} w={w} speed={FRONT_CLOUD.speed} direction="left" flip={flip} />;
}

/**
 * Entrance progress for a burst of sprites: each value runs 0 → 1, with a springy overshoot, one after another
 * (`stagger` ms apart, after `delay`), whenever `animate` turns true. With `animate` false it shows the final pose.
 */
export function useBurst(count: number, { delay = 250, stagger = 160, duration = 650, animate = true } = {}) {
  const [values] = useState(() => Array.from({ length: count }, () => new Animated.Value(animate ? 0 : 1)));
  useEffect(() => {
    if (!animate) return;
    const useNativeDriver = Platform.OS !== 'web';
    // Start from the beginning each time it's (re)triggered, e.g. every time a character is picked.
    values.forEach(value => value.setValue(0));
    const run = Animated.parallel(values.map((value, i) => Animated.sequence([
      Animated.delay(delay + i * stagger),
      Animated.timing(value, { toValue: 1, duration, easing: Easing.out(Easing.back(2.2)), useNativeDriver }),
    ])));
    run.start();
    return () => run.stop();
  }, [values, delay, stagger, duration, animate]);
  return values;
}

/**
 * One sprite of a burst. It grows out of `from` (a canvas point behind the character), spinning, to its
 * designed box. Render each sprite twice: `layer="back"` before the character (visible while flying out
 * from behind it) and `layer="front"` after it (takes over on landing, matching the design's layering).
 */
export function BurstSprite({ progress, asset, x, y, w, from, layer, spin = -270, flip = false }: { progress: Animated.Value; asset: Artwork; x: number; y: number; w: number; from: { x: number; y: number }; layer: 'back' | 'front'; spin?: number; flip?: boolean }) {
  const h = w * artwork[asset].height / artwork[asset].width;
  const travel = (start: number) => progress.interpolate({ inputRange: [0, 1], outputRange: [start, 0] });
  const opacity = progress.interpolate({ inputRange: [0, 0.97, 1], outputRange: layer === 'back' ? [1, 1, 0] : [0, 0, 1], extrapolate: 'clamp' });
  return <Animated.View style={[box(x, y, w, h), { pointerEvents: 'none', opacity, transform: [
    { translateX: travel(from.x - (x + w / 2)) },
    { translateY: travel(from.y - (y + h / 2)) },
    { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.15, 1] }) },
    { rotate: progress.interpolate({ inputRange: [0, 1], outputRange: [`${spin}deg`, '0deg'] }) },
  ] }]}>
    <Art asset={asset} x={0} y={0} w={w} flip={flip} />
  </Animated.View>;
}
