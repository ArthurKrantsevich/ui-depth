/** Глубина: слои из оттенков одного цвета и три уровня тени для тёмной и светлой темы. */

export type Mode = "dark" | "light";
export type Settings = { hue: number; step: number; strength: number };

/** Светлота слоёв. В обеих темах верхний слой светлее: свет падает сверху. */
export function layers(s: Settings, mode: Mode) {
  const base = mode === "dark" ? 0.16 : 0.9;
  const k = s.step;
  return {
    "bg-dark": base,
    bg: base + k,
    "bg-light": Math.min(1, base + k * 2),
    sunken: Math.max(0, base - k * 0.6),
  } as Record<string, number>;
}

export const surface = (l: number, s: Settings) => `oklch(${(l * 100).toFixed(1)}% 0.012 ${s.hue})`;

/** Тени: светлая грань сверху (inset) + тёмная тень снизу. Сила растёт с уровнем. */
export function shadows(s: Settings, mode: Mode) {
  const a = (x: number) => +(x * s.strength * (mode === "dark" ? 1.6 : 1)).toFixed(3);
  const top = mode === "dark" ? "oklch(100% 0 0 / 0.08)" : "oklch(100% 0 0 / 0.9)";
  const ink = `oklch(20% 0.03 ${s.hue}`;
  return {
    s: `inset 0 1px 0 ${top}, 0 1px 2px ${ink} / ${a(0.12)}), 0 2px 6px ${ink} / ${a(0.08)})`,
    m: `inset 0 1px 0 ${top}, 0 2px 4px ${ink} / ${a(0.1)}), 0 8px 20px ${ink} / ${a(0.12)})`,
    l: `inset 0 1px 0 ${top}, 0 4px 8px ${ink} / ${a(0.1)}), 0 20px 48px ${ink} / ${a(0.18)})`,
    sunken: `inset 0 2px 4px ${ink} / ${a(0.18)}), inset 0 -1px 0 ${top}`,
  } as Record<string, string>;
}

export function cssFile(s: Settings) {
  const d = layers(s, "dark");
  const l = layers(s, "light");
  const ds = shadows(s, "dark");
  const ls = shadows(s, "light");
  const block = (L: Record<string, number>, S: Record<string, string>, pad = "  ") =>
    [
      ...Object.entries(L).map(([k, v]) => `${pad}--${k}: ${surface(v, s)};`),
      `${pad}--shadow-s: ${S.s};`,
      `${pad}--shadow-m: ${S.m};`,
      `${pad}--shadow-l: ${S.l};`,
      `${pad}--shadow-sunken: ${S.sunken};`,
    ].join("\n");
  return `:root {
${block(d, ds)}
}

:root[data-theme="light"] {
${block(l, ls)}
}

.raised { background: var(--bg-light); box-shadow: var(--shadow-s); }
.raised:hover { box-shadow: var(--shadow-m); transform: translateY(-2px); }
.raised:active { box-shadow: var(--shadow-sunken); transform: translateY(1px); }
.sunken { background: var(--sunken); box-shadow: var(--shadow-sunken); }

/* в режиме высокого контраста тени и фоны исчезают — оставьте рамку */
@media (forced-colors: active) { .raised, .sunken { border: 1px solid CanvasText; } }
`;
}
