import { useState, type CSSProperties } from "react";
import { Dashboard, DEFAULT, vars } from "./App";
import type { Mode } from "./depth";

/** Учебные экраны: каждый показывает одну идею из ролика и работает сам по себе. */

const Code = ({ lines, hl = -1 }: { lines: string[]; hl?: number }) => (
  <pre className="code">
    {lines.map((l, i) => (
      <span key={i} className={i === hl ? "new" : ""}>
        {l + "\n"}
      </span>
    ))}
  </pre>
);

// ── три тени: маленькая, средняя, большая; одна тень против двух слоёв ─
export function LevelsLab({ mode }: { mode: Mode }) {
  const [two, setTwo] = useState(true);
  const one = mode === "dark" ? "0 8px 20px oklch(0% 0 0 / .5)" : "0 8px 20px oklch(0% 0 0 / .25)";
  return (
    <main className="lab" style={{ ...vars(DEFAULT, mode), background: "var(--bg-dark)" }}>
      <div className="levels">
        {(["s", "m", "l"] as const).map((k, i) => (
          <div key={k} className="lvl" style={{ background: "var(--bg-light)", boxShadow: two ? `var(--shadow-${k})` : one }}>
            <b>{["Маленькая", "Средняя", "Большая"][i]}</b>
            <span>{["кнопки, поля", "карточки", "меню, окна"][i]}</span>
          </div>
        ))}
      </div>
      <button id="two" className="btn primary" onClick={() => setTwo((v) => !v)}>
        {two ? "Как было: одна тень" : "Два слоя + блик сверху"}
      </button>
      <Code lines={["box-shadow:", "  inset 0 1px 0 oklch(100% 0 0 / .08), /* блик */", "  0 2px 4px  oklch(20% .03 260 / .16),  /* короткая */", "  0 8px 20px oklch(20% .03 260 / .19);  /* мягкая */"]} />
    </main>
  );
}

// ── поднять и утопить: карточка над фоном, поле и прогресс под ним ─
export function SunkenLab({ mode }: { mode: Mode }) {
  const [on, setOn] = useState(false);
  return (
    <main className="lab" style={{ ...vars(DEFAULT, mode), background: "var(--bg-dark)" }}>
      <div className="sunk-card" style={{ background: "var(--bg)", boxShadow: on ? "var(--shadow-m)" : "none", border: on ? "1px solid transparent" : "1px solid var(--line)" }}>
        <div className="sunk-title">Тариф «Команда» · 7 из 10 мест</div>
        <div className="track" style={{ background: on ? "var(--sunken)" : "var(--bg)", boxShadow: on ? "var(--shadow-sunken)" : "none", border: on ? "1px solid transparent" : "1px solid var(--line)" }}>
          <i style={{ width: "70%", boxShadow: on ? "var(--shadow-s)" : "none" }} />
        </div>
        <div className="field-s" style={{ background: on ? "var(--sunken)" : "var(--bg)", boxShadow: on ? "var(--shadow-sunken)" : "none", border: on ? "1px solid transparent" : "1px solid var(--line)" }}>
          Пригласить по email…
        </div>
        <button className="raise-btn" style={{ background: "var(--bg-light)", boxShadow: on ? "var(--shadow-s)" : "none", border: on ? "1px solid transparent" : "1px solid var(--line)" }}>
          Добавить место
        </button>
      </div>
      <button id="sunk" className="btn primary" onClick={() => setOn((v) => !v)}>
        {on ? "Как было: всё на одном уровне" : "Поднять карточку, утопить поле и шкалу"}
      </button>
    </main>
  );
}

// ── разбор экрана: дашборд по шагам ─
const FIX = [
  { label: "Всё на одном уровне", css: ["/* рамки везде, фон один */"] },
  { label: "Слои из оттенков", css: [".page    { background: var(--bg-dark); }", ".card    { background: var(--bg); }"] },
  { label: "Светлее — интерактивное", css: [".active, .chip { background: var(--bg-light); }"] },
  { label: "Тени вместо рамок", css: [".card     { box-shadow: var(--shadow-s); }", ".card.big { box-shadow: var(--shadow-m); }"] },
  { label: "Утопить таблицу", css: [".table { background: var(--sunken);", "         box-shadow: var(--shadow-sunken); }"] },
];
export function FixLab({ mode }: { mode: Mode }) {
  const [step, setStep] = useState(0);
  return (
    <main className="lab two">
      <Dashboard s={DEFAULT} mode={mode} depth={step} />
      <div className="side">
        <div className="seg vertical" role="radiogroup" aria-label="Шаг">
          {FIX.map((x, i) => (
            <button key={x.label} id={`fix-${i}`} role="radio" aria-checked={step === i} onClick={() => setStep(i)}>
              {i}. {x.label}
            </button>
          ))}
        </div>
        <Code lines={FIX.slice(0, step + 1).flatMap((x) => x.css)} hl={FIX.slice(0, step + 1).flatMap((x) => x.css).length - 1} />
      </div>
    </main>
  );
}

// ── наведение и нажатие: поднимается, вдавливается ─
export function HoverLab({ mode }: { mode: Mode }) {
  return (
    <main className="lab" style={{ ...vars(DEFAULT, mode), background: "var(--bg-dark)" }}>
      <div className="hover-row">
        {["Быстрая", "Точная", "Своя"].map((x, i) => (
          <button key={x} id={`card-${i}`} className="lift">
            <b>{x}</b>
            <span>{["ответ за 1 секунду", "лучшее качество", "настроить вручную"][i]}</span>
          </button>
        ))}
      </div>
      <Code lines={[".card        { box-shadow: var(--shadow-s); transition: .2s; }", ".card:hover  { box-shadow: var(--shadow-m); translate: 0 -2px; }", ".card:active { box-shadow: var(--shadow-sunken); translate: 0 1px; }"]} />
    </main>
  );
}

// ── тёмная тема: тень не видно, высоту показывает светлота ─
export function DarkLab() {
  const [light, setLight] = useState(false);
  const s = { ...DEFAULT, strength: 1.4 };
  return (
    <main className="lab" style={{ ...vars(s, "dark"), background: "var(--bg-dark)" }}>
      <div className="levels">
        {(["s", "m", "l"] as const).map((k, i) => (
          <div key={k} className="lvl" style={{ background: light ? `oklch(${20 + i * 5}% 0.012 260)` : "oklch(20% 0.012 260)", boxShadow: `var(--shadow-${k})` }}>
            <b>Уровень {i + 1}</b>
            <span>{light ? `светлота ${20 + i * 5}%` : "только тень"}</span>
          </div>
        ))}
      </div>
      <button id="dark-light" className="btn primary" onClick={() => setLight((v) => !v)}>
        {light ? "Как было: только тень" : "Выше — светлее"}
      </button>
      <Code lines={["/* в тёмной теме тень почти не видна —", "   высоту показывает светлота поверхности */", ".level-1 { background: oklch(20% .012 260); }", ".level-2 { background: oklch(25% .012 260); }", ".level-3 { background: oklch(30% .012 260); }"]} />
    </main>
  );
}

// ── цветная тень: серая тень на цветном фоне выглядит грязной ─
export function ColorShadowLab() {
  const [tint, setTint] = useState(false);
  const bg = "oklch(78% 0.12 75)";
  const sh = (c: string) => `0 2px 4px ${c} / .25), 0 16px 36px ${c} / .3)`;
  const card: CSSProperties = { background: "oklch(92% 0.05 80)", boxShadow: sh(tint ? "oklch(40% 0.1 60" : "oklch(0% 0 0") };
  return (
    <main className="lab" style={{ background: bg }}>
      <div className="color-card" style={card}>
        <b>Осенняя распродажа</b>
        <span>До −40% на тёплые вещи до воскресенья.</span>
      </div>
      <button id="tint" className="btn primary" onClick={() => setTint((v) => !v)}>
        {tint ? "Как было: чёрная тень" : "Тень в цвет фона"}
      </button>
      <Code lines={["/* серая тень на тёплом фоне — грязная */", "box-shadow: 0 16px 36px oklch(0% 0 0 / .3);", "", "/* тень того же оттенка, только темнее */", "box-shadow: 0 16px 36px oklch(40% .1 60 / .3);"]} hl={tint ? 4 : 1} />
    </main>
  );
}
