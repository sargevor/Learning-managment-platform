import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Card, DemoFlag } from '../ui/Misc';

/* Chart palette — one accent hue with tints, plus semantic colors. */
export const CHART_COLORS = ['#4a5bd0', '#0f1e3d', '#8c99ec', '#1f8a5b', '#b4730f', '#7a3e8c'];

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

function niceMax(v: number): number {
  if (v <= 0) return 10;
  const exp = Math.pow(10, Math.floor(Math.log10(v)));
  const n = v / exp;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
  return step * exp;
}

interface Tip {
  x: number;
  y: number;
  text: string;
}

/* ---------- Bar chart (single or grouped series) ---------- */

export interface Series {
  name: string;
  values: number[];
  color?: string;
}

export function BarChart({ labels, series, height = 220, max, suffix = '', highlightLast = false, ariaLabel }: { labels: string[]; series: Series[]; height?: number; max?: number; suffix?: string; highlightLast?: boolean; ariaLabel: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [tip, setTip] = useState<Tip | null>(null);
  const pad = { t: 12, r: 8, b: 26, l: 36 };
  const innerW = Math.max(0, width - pad.l - pad.r);
  const innerH = height - pad.t - pad.b;
  const top = max ?? niceMax(Math.max(...series.flatMap((s) => s.values), 1));
  const groupW = labels.length ? innerW / labels.length : 0;
  const barGap = 3;
  const barW = Math.max(4, Math.min(34, (groupW * 0.62 - barGap * (series.length - 1)) / series.length));
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {width > 0 && (
        <svg className="chart" width={width} height={height} role="img" aria-label={ariaLabel}>
          {ticks.map((t) => {
            const y = pad.t + innerH * (1 - t);
            return (
              <g key={t}>
                <line className="grid-line" x1={pad.l} x2={width - pad.r} y1={y} y2={y} />
                <text x={pad.l - 8} y={y + 4} textAnchor="end">{Math.round(top * t)}</text>
              </g>
            );
          })}
          {labels.map((label, i) => {
            const gx = pad.l + groupW * i + (groupW - (barW * series.length + barGap * (series.length - 1))) / 2;
            return (
              <g key={label + i}>
                {series.map((s, si) => {
                  const v = s.values[i] ?? 0;
                  const h = (v / top) * innerH;
                  const x = gx + si * (barW + barGap);
                  const y = pad.t + innerH - h;
                  const base = s.color ?? CHART_COLORS[si % CHART_COLORS.length];
                  const fill = highlightLast && series.length === 1 && i !== labels.length - 1 ? '#c5cbf3' : base;
                  return (
                    <rect
                      key={s.name}
                      x={x}
                      y={y}
                      width={barW}
                      height={Math.max(h, v > 0 ? 2 : 0)}
                      rx={Math.min(4, barW / 2)}
                      fill={fill}
                      onMouseEnter={() => setTip({ x: x + barW / 2, y, text: `${series.length > 1 ? s.name + '՝ ' : label + '՝ '}${v}${suffix}` })}
                      onMouseLeave={() => setTip(null)}
                    />
                  );
                })}
                <text x={pad.l + groupW * i + groupW / 2} y={height - 8} textAnchor="middle">{label}</text>
              </g>
            );
          })}
        </svg>
      )}
      {tip && (
        <div className="chart-tip" style={{ left: tip.x, top: tip.y }}>
          {tip.text}
        </div>
      )}
    </div>
  );
}

/* ---------- Line chart ---------- */

export function LineChart({ labels, series, height = 240, max, min = 0, suffix = '', area = true, ariaLabel }: { labels: string[]; series: Series[]; height?: number; max?: number; min?: number; suffix?: string; area?: boolean; ariaLabel: string }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const pad = { t: 14, r: 12, b: 26, l: 38 };
  const innerW = Math.max(0, width - pad.l - pad.r);
  const innerH = height - pad.t - pad.b;
  const top = max ?? niceMax(Math.max(...series.flatMap((s) => s.values), 1));
  const step = labels.length > 1 ? innerW / (labels.length - 1) : 0;
  const xAt = (i: number) => pad.l + step * i;
  const yAt = (v: number) => pad.t + innerH * (1 - (v - min) / (top - min));
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const labelEvery = Math.ceil(labels.length / Math.max(1, Math.floor(innerW / 56)));

  return (
    <div ref={ref} style={{ position: 'relative' }} onMouseLeave={() => setHover(null)}>
      {width > 0 && (
        <svg
          className="chart"
          width={width}
          height={height}
          role="img"
          aria-label={ariaLabel}
          onMouseMove={(e) => {
            const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
            const i = Math.round((e.clientX - rect.left - pad.l) / (step || 1));
            setHover(Math.max(0, Math.min(labels.length - 1, i)));
          }}
        >
          <defs>
            {series.map((s, si) => (
              <linearGradient key={s.name} id={`area-${si}-${s.name.length}`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor={s.color ?? CHART_COLORS[si]} stopOpacity="0.18" />
                <stop offset="100%" stopColor={s.color ?? CHART_COLORS[si]} stopOpacity="0" />
              </linearGradient>
            ))}
          </defs>
          {ticks.map((t) => {
            const v = min + (top - min) * t;
            const y = yAt(v);
            return (
              <g key={t}>
                <line className="grid-line" x1={pad.l} x2={width - pad.r} y1={y} y2={y} />
                <text x={pad.l - 8} y={y + 4} textAnchor="end">{Math.round(v)}</text>
              </g>
            );
          })}
          {labels.map((l, i) =>
            i % labelEvery === 0 || i === labels.length - 1 ? (
              <text key={l + i} x={xAt(i)} y={height - 8} textAnchor="middle">{l}</text>
            ) : null,
          )}
          {series.map((s, si) => {
            const color = s.color ?? CHART_COLORS[si];
            const pts = s.values.map((v, i) => `${xAt(i)},${yAt(v)}`).join(' ');
            return (
              <g key={s.name}>
                {area && series.length === 1 && <polygon points={`${xAt(0)},${yAt(min)} ${pts} ${xAt(s.values.length - 1)},${yAt(min)}`} fill={`url(#area-${si}-${s.name.length})`} />}
                <polyline points={pts} fill="none" stroke={color} strokeWidth={2.25} strokeLinejoin="round" strokeLinecap="round" />
                {hover !== null && <circle cx={xAt(hover)} cy={yAt(s.values[hover] ?? 0)} r={4.5} fill="#fff" stroke={color} strokeWidth={2} />}
              </g>
            );
          })}
          {hover !== null && <line x1={xAt(hover)} x2={xAt(hover)} y1={pad.t} y2={pad.t + innerH} stroke="#cdd2dc" strokeDasharray="3 3" />}
        </svg>
      )}
      {hover !== null && width > 0 && (
        <div className="chart-tip" style={{ left: xAt(hover), top: yAt(Math.max(...series.map((s) => s.values[hover] ?? 0))) }}>
          <strong>{labels[hover]}</strong>
          {series.map((s) => (
            <div key={s.name}>
              {series.length > 1 ? `${s.name}՝ ` : ''}
              {s.values[hover]}
              {suffix}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Horizontal bars (comparisons) ---------- */

export function HBarChart({ items, max = 100, suffix = '%', color = CHART_COLORS[0] }: { items: { label: string; value: number; sub?: string }[]; max?: number; suffix?: string; color?: string }) {
  return (
    <div className="stack" style={{ ['--gap' as string]: '14px' }}>
      {items.map((it) => (
        <div key={it.label}>
          <div className="row row--between" style={{ marginBottom: 6 }}>
            <span className="small strong" style={{ color: 'var(--navy-900)' }}>{it.label}</span>
            <span className="small tabular strong">
              {it.value}
              {suffix}
            </span>
          </div>
          <div className="progress__track" style={{ height: 8 }}>
            <div className="progress__fill" style={{ width: `${(it.value / max) * 100}%`, background: color }} />
          </div>
          {it.sub && <div className="xs muted" style={{ marginTop: 4 }}>{it.sub}</div>}
        </div>
      ))}
    </div>
  );
}

/* ---------- Donut ---------- */

export function DonutChart({ segments, size = 160, thickness = 22, center }: { segments: { label: string; value: number; color: string }[]; size?: number; thickness?: number; center?: ReactNode }) {
  const total = segments.reduce((n, s) => n + s.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="row" style={{ ['--gap' as string]: '24px', flexWrap: 'wrap' }}>
      <div className="ring" style={{ width: size, height: size }}>
        <svg width={size} height={size} role="img" aria-label={segments.map((s) => `${s.label}՝ ${s.value}`).join(', ')}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eceef3" strokeWidth={thickness} />
          {segments.map((s) => {
            const len = (s.value / total) * c;
            const el = <circle key={s.label} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={thickness} strokeDasharray={`${Math.max(0, len - 2)} ${c}`} strokeDashoffset={-offset} />;
            offset += len;
            return el;
          })}
        </svg>
        {center && <div className="ring__label">{center}</div>}
      </div>
      <div className="stack" style={{ ['--gap' as string]: '10px' }}>
        {segments.map((s) => (
          <div key={s.label} className="row small" style={{ ['--gap' as string]: '8px' }}>
            <i style={{ width: 10, height: 10, borderRadius: 3, background: s.color, display: 'inline-block' }} aria-hidden="true" />
            <span className="secondary">{s.label}</span>
            <strong className="tabular" style={{ marginLeft: 'auto', paddingLeft: 12 }}>{s.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Chart container ---------- */

export function ChartCard({ title, subtitle, legend, actions, demo = true, children }: { title: string; subtitle?: ReactNode; legend?: { label: string; color: string }[]; actions?: ReactNode; demo?: boolean; children: ReactNode }) {
  return (
    <Card
      className="chart-card"
      title={title}
      subtitle={subtitle}
      actions={
        <>
          {demo && <DemoFlag />}
          {actions}
        </>
      }
    >
      {legend && (
        <div className="chart-legend" style={{ marginBottom: 10 }}>
          {legend.map((l) => (
            <span key={l.label}>
              <i style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      )}
      {children}
    </Card>
  );
}
