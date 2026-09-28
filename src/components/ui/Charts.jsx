import { useElementWidth } from '../../hooks/useElementWidth';

const PAD = { l: 38, r: 10, t: 10, b: 24 };
const nice = (v) => { const p = 10 ** Math.floor(Math.log10(v || 1)); const n = (v || 1) / p; return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p; };

function useGeometry(data, height, width) {
  const max = nice(Math.max(1, ...data.map((d) => d.value)) * 1.05);
  const iw = width - PAD.l - PAD.r; const ih = height - PAD.t - PAD.b;
  const ticks = [0, 1, 2, 3, 4].map((i) => (max / 4) * i);
  const y = (v) => PAD.t + ih - (v / max) * ih;
  return { max, iw, ih, ticks, y };
}

function Grid({ ticks, y, width, unit }) {
  return ticks.map((t) => (
    <g key={t}>
      <line x1={PAD.l} x2={width - PAD.r} y1={y(t)} y2={y(t)} className="chart-grid" />
      <text x={PAD.l - 6} y={y(t) + 3.5} textAnchor="end" className="chart-label">{t >= 1000 ? `${t / 1000}k` : Math.round(t)}{unit}</text>
    </g>
  ));
}

const xLabels = (data, xAt, height, step) => data.map((d, i) => (i % step === 0 || i === data.length - 1) && (
  <text key={i} x={xAt(i)} y={height - 6} textAnchor="middle" className="chart-label">{d.label}</text>
));

export function LineChart({ data, height = 180, unit = '', label = 'Line chart' }) {
  const [ref, width] = useElementWidth();
  const { iw, ticks, y } = useGeometry(data, height, width);
  const n = data.length;
  const xAt = (i) => PAD.l + (n === 1 ? iw / 2 : (iw / (n - 1)) * i);
  const pts = data.map((d, i) => [xAt(i), y(d.value)]);
  let line = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) line += ` Q${pts[i][0]},${pts[i][1]} ${(pts[i][0] + pts[i + 1][0]) / 2},${(pts[i][1] + pts[i + 1][1]) / 2}`;
  if (pts.length > 1) line += ` L${pts.at(-1)[0]},${pts.at(-1)[1]}`;
  const base = y(0);
  const area = `${line} L${pts.at(-1)[0]},${base} L${pts[0][0]},${base} Z`;
  return (
    <div ref={ref} className="chart">
      <svg width={width} height={height} role="img" aria-label={label}>
        <Grid ticks={ticks} y={y} width={width} unit={unit} />
        <path d={area} className="chart-area" />
        <path d={line} className="chart-line" fill="none" />
        {data.length <= 14 && pts.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="3" className="chart-dot"><title>{`${data[i].label}: ${data[i].value}${unit}`}</title></circle>)}
        {xLabels(data, xAt, height, Math.ceil(n / Math.max(2, Math.floor(iw / 56))))}
      </svg>
    </div>
  );
}

export function BarChart({ data, height = 180, unit = '', label = 'Bar chart' }) {
  const [ref, width] = useElementWidth();
  const { iw, ticks, y } = useGeometry(data, height, width);
  const slot = iw / data.length; const bw = Math.min(26, slot * 0.55);
  const xAt = (i) => PAD.l + slot * i + slot / 2;
  return (
    <div ref={ref} className="chart">
      <svg width={width} height={height} role="img" aria-label={label}>
        <Grid ticks={ticks} y={y} width={width} unit={unit} />
        {data.map((d, i) => <rect key={i} x={xAt(i) - bw / 2} y={y(d.value)} width={bw} height={Math.max(0, y(0) - y(d.value))} rx="3" className="chart-bar"><title>{`${d.label}: ${d.value}${unit}`}</title></rect>)}
        {xLabels(data, xAt, height, 1)}
      </svg>
    </div>
  );
}
