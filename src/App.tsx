import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { ColorShadowLab, DarkLab, FixLab, HoverLab, LevelsLab, SunkenLab } from "./Labs";
import { cssFile, layers, shadows, surface, type Mode, type Settings } from "./depth";

const VIEWS = [
  { id: "", label: "Слои" },
  { id: "levels", label: "Три тени" },
  { id: "sunken", label: "Поднять и утопить" },
  { id: "fix", label: "Разбор экрана" },
  { id: "hover", label: "Наведение" },
  { id: "dark", label: "Тёмная тема" },
  { id: "color", label: "Цветная тень" },
];

const useHash = () => {
  const read = () => location.hash.replace(/^#\/?/, "");
  const [h, setH] = useState(read);
  useEffect(() => {
    const on = () => setH(read());
    addEventListener("hashchange", on);
    return () => removeEventListener("hashchange", on);
  }, []);
  return h;
};

export const DEFAULT: Settings = { hue: 260, step: 0.04, strength: 1 };

/** Переменные глубины для блока — им красятся все экраны. */
export function vars(s: Settings, mode: Mode): CSSProperties {
  const L = layers(s, mode);
  const S = shadows(s, mode);
  const v: Record<string, string> = {};
  for (const [k, l] of Object.entries(L)) v[`--${k}`] = surface(l, s);
  for (const [k, x] of Object.entries(S)) v[`--shadow-${k}`] = x;
  v["--ink"] = mode === "dark" ? "oklch(96% 0.006 260)" : "oklch(20% 0.01 260)";
  v["--muted"] = mode === "dark" ? "oklch(72% 0.006 260)" : "oklch(45% 0.01 260)";
  v["--line"] = mode === "dark" ? "oklch(30% 0.012 260)" : "oklch(84% 0.012 260)";
  return v as CSSProperties;
}

export function App() {
  const view = useHash();
  const [mode, setMode] = useState<Mode>("dark");
  return (
    <div className="app">
      <nav className="nav" aria-label="Разделы">
        <span className="logo">
          <i />
          Глубина
        </span>
        {VIEWS.map((v) => (
          <a key={v.id} href={`#/${v.id}`} aria-current={view === v.id ? "page" : undefined}>
            {v.label}
          </a>
        ))}
        <span className="nav-gap" />
        <div className="seg" role="radiogroup" aria-label="Тема">
          {(["dark", "light"] as const).map((m) => (
            <button key={m} id={`mode-${m}`} role="radio" aria-checked={mode === m} onClick={() => setMode(m)}>
              {m === "dark" ? "Тёмная" : "Светлая"}
            </button>
          ))}
        </div>
      </nav>
      {view === "" && <Tool mode={mode} />}
      {view === "levels" && <LevelsLab mode={mode} />}
      {view === "sunken" && <SunkenLab mode={mode} />}
      {view === "fix" && <FixLab mode={mode} />}
      {view === "hover" && <HoverLab mode={mode} />}
      {view === "dark" && <DarkLab />}
      {view === "color" && <ColorShadowLab />}
    </div>
  );
}

/** Дашборд-пример: страница, разделы, интерактивные элементы и утопленная таблица. */
export function Dashboard({ s, mode, depth = 4 }: { s: Settings; mode: Mode; depth?: number }) {
  const v = vars(s, mode);
  const lay = depth >= 1;
  const card: CSSProperties = { background: lay ? "var(--bg)" : "var(--bg-dark)", border: lay && depth >= 3 ? "1px solid transparent" : "1px solid var(--line)", boxShadow: depth >= 3 ? "var(--shadow-s)" : "none" };
  const big: CSSProperties = { ...card, boxShadow: depth >= 3 ? "var(--shadow-m)" : "none" };
  const inter: CSSProperties = { background: depth >= 2 ? "var(--bg-light)" : "transparent", boxShadow: depth >= 3 ? "var(--shadow-s)" : "none", border: depth >= 2 ? "1px solid transparent" : "1px solid var(--line)" };
  const table: CSSProperties = { background: depth >= 4 ? "var(--sunken)" : card.background, boxShadow: depth >= 4 ? "var(--shadow-sunken)" : "none", border: depth >= 4 ? "1px solid transparent" : "1px solid var(--line)" };
  return (
    <div className="dash" style={{ ...v, background: "var(--bg-dark)" }}>
      <aside className="d-side" style={card}>
        {["Обзор", "Платежи", "Клиенты", "Отчёты"].map((x, i) => (
          <div key={x} className="d-nav" style={i === 0 ? inter : undefined}>
            {x}
          </div>
        ))}
      </aside>
      <div className="d-main">
        <div className="d-row">
          <div className="d-card" style={card}>
            <div className="d-label">Выручка</div>
            <div className="d-num">1 284 500 ₽</div>
            <div className="d-up">+12% за месяц</div>
          </div>
          <div className="d-card" style={big}>
            <div className="d-label">Активные клиенты</div>
            <div className="d-num">3 912</div>
            <div className="d-chips">
              <span style={inter}>Неделя</span>
              <span>Месяц</span>
              <span>Год</span>
            </div>
          </div>
        </div>
        <div className="d-table" style={table}>
          {[["Анна С.", "Оплачено", "24 900 ₽"], ["Олег П.", "Ожидает", "8 400 ₽"], ["Ира К.", "Оплачено", "61 000 ₽"]].map((r) => (
            <div key={r[0]} className="d-tr">
              {r.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Tool({ mode }: { mode: Mode }) {
  const [s, setS] = useState<Settings>(DEFAULT);
  const [copied, setCopied] = useState(false);
  const css = useMemo(() => cssFile(s), [s]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(css);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* буфер обмена недоступен — CSS виден справа */
    }
  };
  const R = ({ id, label, k, min, max, step, fmt }: { id: string; label: string; k: keyof Settings; min: number; max: number; step: number; fmt: (v: number) => string }) => (
    <label className="slider" htmlFor={id}>
      <span className="slider-head">
        {label} <b>{fmt(s[k])}</b>
      </span>
      <input id={id} type="range" min={min} max={max} step={step} value={s[k]} onChange={(e) => setS({ ...s, [k]: +e.target.value })} />
    </label>
  );
  const L = layers(s, mode);
  return (
    <main className="tool">
      <aside className="panel">
        <h2>Слои</h2>
        <R id="step" label="Шаг светлоты" k="step" min={0.01} max={0.08} step={0.005} fmt={(v) => `${Math.round(v * 100)}%`} />
        <R id="hue" label="Оттенок" k="hue" min={0} max={360} step={1} fmt={(v) => `${v}°`} />
        <h2>Тени</h2>
        <R id="strength" label="Сила" k="strength" min={0} max={2.5} step={0.1} fmt={(v) => `×${v.toFixed(1)}`} />
        <div className="swatches">
          {Object.entries(L).map(([k, l]) => (
            <div key={k} className="swatch">
              <span style={{ background: surface(l, s) }} />
              <code>--{k}</code>
            </div>
          ))}
        </div>
        <button id="copy" className="btn primary wide" onClick={copy}>
          {copied ? "Скопировано ✓" : "Скопировать CSS"}
        </button>
      </aside>
      <section className="stage-wrap">
        <Dashboard s={s} mode={mode} />
      </section>
      <pre className="css-out">{css}</pre>
    </main>
  );
}
