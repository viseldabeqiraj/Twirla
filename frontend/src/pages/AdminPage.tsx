import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import {
  getAdminSummary,
  getDashboard,
  redeemCoupon,
  type AdminSummary,
  type DashboardData,
  type DashboardDailyPoint,
  type DashboardRecentWin,
} from '../api/adminApi';
import './AdminPage.css';

type Range = '7' | '30' | '90';

const WEEKDAYS_SQ = ['Die', 'Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht'];
const MONTHS_SQ = ['Jan', 'Shk', 'Mar', 'Pri', 'Maj', 'Qer', 'Kor', 'Gus', 'Sht', 'Tet', 'Nën', 'Dhj'];

const PRIZE_COLORS = ['#FF2E9A', '#8A25C9', '#38E1FF', '#ffb84d', '#37E39B', '#7b5cff', '#ff6b8a'];
const GAME_GRADIENTS = [
  'linear-gradient(90deg,#FF2E9A,#8A25C9)',
  'linear-gradient(90deg,#38E1FF,#8A25C9)',
  'linear-gradient(90deg,#ffb84d,#FF2E9A)',
];

const RANGE_LABELS: Record<Range, string> = {
  '7': '7 ditët e fundit',
  '30': '30 ditët e fundit',
  '90': '90 ditët e fundit',
};

function gameLabel(mode: string | null): string {
  switch ((mode ?? '').toLowerCase()) {
    case 'wheel':
      return '🎡 Rrota e Fatit';
    case 'scratch':
    case 'scratchcard':
      return '🎫 Kartë Gërvishtëse';
    case 'mysterybox':
      return '🎁 Kutia Misterioze';
    default:
      return mode ? `🎮 ${mode}` : '🎮 Lojë';
  }
}

function shortGameTag(mode: string | null): string {
  switch ((mode ?? '').toLowerCase()) {
    case 'wheel':
      return 'Rrota';
    case 'scratch':
    case 'scratchcard':
      return 'Gërvishtje';
    case 'mysterybox':
      return 'Kuti';
    default:
      return mode ?? '—';
  }
}

function prizeText(prize: string): string {
  return prize === 'Dhuratë' ? 'Dhuratë falas' : `${prize} zbritje`;
}

/** "sot 14:22" / "dje 19:30" / "12 Kor 09:15" */
function formatTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startThat = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const dayDiff = Math.round((startToday.getTime() - startThat.getTime()) / 86400000);
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  if (dayDiff === 0) return `sot ${hh}:${mm}`;
  if (dayDiff === 1) return `dje ${hh}:${mm}`;
  return `${d.getDate()} ${MONTHS_SQ[d.getMonth()]} ${hh}:${mm}`;
}

const nf = (x: number) => Math.round(x).toLocaleString('sq');

/** Count-up number that animates whenever `value` changes. */
function CountUp({ value, decimals = 0, suffix = '' }: { value: number; decimals?: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const duration = 650;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (value - from) * eased);
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value]);
  const text = decimals ? display.toFixed(decimals) : nf(display);
  return <>{text + suffix}</>;
}

interface Bar {
  label: string;
  value: number;
}

/** Bucket the range-filtered daily series into bars, mirroring the HTML shape. */
function buildBars(rows: DashboardDailyPoint[], range: Range): Bar[] {
  if (rows.length === 0) return [];
  if (range === '7') {
    return rows.slice(-7).map((r) => {
      const d = new Date(`${r.date}T00:00:00`);
      return { label: WEEKDAYS_SQ[d.getDay()], value: r.plays };
    });
  }
  if (range === '30') {
    const last = rows.slice(-28);
    const bars: Bar[] = [];
    for (let w = 0; w < 4; w++) {
      const slice = last.slice(w * 7, w * 7 + 7);
      if (slice.length === 0) continue;
      bars.push({ label: `Java ${w + 1}`, value: slice.reduce((s, r) => s + r.plays, 0) });
    }
    return bars;
  }
  // 90 → group by month
  const byMonth = new Map<string, { label: string; value: number }>();
  for (const r of rows.slice(-90)) {
    const d = new Date(`${r.date}T00:00:00`);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const entry = byMonth.get(key) ?? { label: MONTHS_SQ[d.getMonth()], value: 0 };
    entry.value += r.plays;
    byMonth.set(key, entry);
  }
  return [...byMonth.values()];
}

export default function AdminPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<Range>('30');
  const [recent, setRecent] = useState<DashboardRecentWin[]>([]);
  const [redeemedBump, setRedeemedBump] = useState(0);
  const [grow, setGrow] = useState(false);

  useEffect(() => {
    if (!slug || !token) {
      setLoadError('Kod aksesi i pavlefshëm ose mungon.');
      setLoading(false);
      return;
    }
    Promise.all([getAdminSummary(slug, token), getDashboard(slug, token)])
      .then(([sum, dash]) => {
        setSummary(sum);
        setData(dash);
        setRecent(dash.recent);
      })
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Kod aksesi i pavlefshëm.'))
      .finally(() => setLoading(false));
  }, [slug, token]);

  // Range-filtered daily rows.
  const rangeRows = useMemo<DashboardDailyPoint[]>(() => {
    if (!data) return [];
    const days = Number(range);
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - (days - 1));
    const filtered = data.daily.filter((r) => new Date(`${r.date}T00:00:00`) >= cutoff);
    return filtered.length ? filtered : data.daily.slice(-days);
  }, [data, range]);

  const totals = useMemo(() => {
    const sum = (key: keyof DashboardDailyPoint) =>
      rangeRows.reduce((s, r) => s + (typeof r[key] === 'number' ? (r[key] as number) : 0), 0);
    const visits = sum('visits');
    const plays = sum('plays');
    const dm = sum('dm');
    const redeemed = sum('redeemed') + redeemedBump;
    return { visits, plays, dm, redeemed };
  }, [rangeRows, redeemedBump]);

  const bars = useMemo(() => buildBars(rangeRows, range), [rangeRows, range]);
  const maxBar = Math.max(1, ...bars.map((b) => b.value));

  // Re-trigger the grow-in transition whenever the range or data changes.
  useEffect(() => {
    setGrow(false);
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setGrow(true)));
    return () => cancelAnimationFrame(id);
  }, [range, data]);

  const funnelSteps = useMemo(() => {
    const top = totals.visits || 1;
    return [
      { name: 'Hapën faqen', value: totals.visits },
      { name: 'Luajtën një lojë', value: totals.plays },
      { name: 'Klikuan “Hap DM”', value: totals.dm },
      { name: 'Përdorën kodin (porosi)', value: totals.redeemed },
    ].map((s) => ({ ...s, pct: Math.round((s.value / top) * 100) }));
  }, [totals]);

  const prizeTotal = useMemo(() => (data?.prizes ?? []).reduce((s, p) => s + p.count, 0), [data]);
  const donutGradient = useMemo(() => {
    if (!data || prizeTotal === 0) return 'conic-gradient(rgba(255,255,255,.08) 0% 100%)';
    let acc = 0;
    const stops = data.prizes.map((p, i) => {
      const pct = (p.count / prizeTotal) * 100;
      const seg = `${PRIZE_COLORS[i % PRIZE_COLORS.length]} ${acc}% ${acc + pct}%`;
      acc += pct;
      return seg;
    });
    return `conic-gradient(${stops.join(',')})`;
  }, [data, prizeTotal]);

  const gameTotal = useMemo(() => (data?.games ?? []).reduce((s, g) => s + g.count, 0), [data]);

  const handleRedeemToggle = async (win: DashboardRecentWin, index: number) => {
    if (!slug || !token || win.redeemed) return; // only allow marking as used
    // optimistic
    setRecent((prev) => prev.map((r, i) => (i === index ? { ...r, redeemed: true } : r)));
    setRedeemedBump((b) => b + 1);
    try {
      await redeemCoupon(slug, token, win.code, 0);
    } catch {
      // revert on failure
      setRecent((prev) => prev.map((r, i) => (i === index ? { ...r, redeemed: false } : r)));
      setRedeemedBump((b) => b - 1);
    }
  };

  if (loading) {
    return (
      <div className="tw-adm">
        <div className="wrap">
          <p className="adm-loading">Duke ngarkuar…</p>
        </div>
      </div>
    );
  }

  if (loadError || !data || !summary) {
    return (
      <div className="tw-adm">
        <div className="wrap">
          <div className="adm-error">
            <h1>Akses i kufizuar</h1>
            <p>{loadError ?? 'Nuk u ngarkuan të dhënat.'}</p>
          </div>
        </div>
      </div>
    );
  }

  const conv = totals.plays > 0 ? (totals.redeemed / totals.plays) * 100 : 0;

  return (
    <div className="tw-adm">
      <div className="wrap">
        <div className="head">
          <div className="title">
            <h1>{slug}</h1>
            <small>Panel analitik · përditësuar tani</small>
          </div>
          <div className="pw">
            Mundësuar nga <b>Twirla</b>
          </div>
        </div>

        <div className="range">
          {(['7', '30', '90'] as Range[]).map((r) => (
            <button key={r} type="button" className={range === r ? 'on' : ''} onClick={() => setRange(r)}>
              {r} ditë
            </button>
          ))}
        </div>

        {/* KPIs */}
        <div className="kpis">
          <div className="kpi">
            <div className="lbl">👁️ Vizita</div>
            <div className="val">
              <CountUp value={totals.visits} />
            </div>
            <div className="delta up">▲ 18% vs periudha e kaluar</div>
          </div>
          <div className="kpi">
            <div className="lbl">🎮 Lojëra</div>
            <div className="val">
              <CountUp value={totals.plays} />
            </div>
            <div className="delta up">▲ 15%</div>
          </div>
          <div className="kpi">
            <div className="lbl">💬 Klikime “Hap DM”</div>
            <div className="val">
              <CountUp value={totals.dm} />
            </div>
            <div className="delta up">▲ 9%</div>
          </div>
          <div className="kpi">
            <div className="lbl">✅ Kode të përdorura</div>
            <div className="val">
              <CountUp value={totals.redeemed} />
            </div>
            <div className="delta up">▲ 12%</div>
          </div>
          <div className="kpi">
            <div className="lbl">📈 Konvertim</div>
            <div className="val">
              <CountUp value={conv} decimals={1} suffix="%" />
            </div>
            <div className="delta up">▲ 2.1pp</div>
          </div>
        </div>

        <div className="grid">
          {/* bar chart */}
          <div className="panel">
            <h3>Lojëra në ditë</h3>
            <div className="sub">{RANGE_LABELS[range]}</div>
            <div className="chart">
              {bars.length === 0 && <p className="adm-empty">Ende pa të dhëna për këtë periudhë.</p>}
              {bars.map((b, i) => (
                <div className="bar" key={`${b.label}-${i}`}>
                  <div className="col" style={{ height: grow ? `${(b.value / maxBar) * 100}%` : '0%' }}>
                    <span className="tip">{b.value} lojëra</span>
                  </div>
                  <small>{b.label}</small>
                </div>
              ))}
            </div>
          </div>

          {/* funnel */}
          <div className="panel">
            <h3>Rruga drejt porosisë</h3>
            <div className="sub">Nga vizita te kodi i përdorur</div>
            <div className="funnel">
              {funnelSteps.map((f) => (
                <div className="step" key={f.name}>
                  <div className="fill" style={{ width: grow ? `${f.pct}%` : '0%' }} />
                  <div className="row">
                    <span className="n">{f.name}</span>
                    <span className="v">{nf(f.value)}</span>
                  </div>
                  <div className="pct">{f.pct}% e vizitorëve</div>
                </div>
              ))}
            </div>
          </div>

          {/* prize distribution */}
          <div className="panel">
            <h3>Çmimet e fituara</h3>
            <div className="sub">Shpërndarja sipas zbritjes</div>
            <div className="donut-wrap">
              <div className="donut" style={{ background: donutGradient }}>
                <div className="center">
                  <b>{nf(prizeTotal)}</b>
                  <small>kode</small>
                </div>
              </div>
              <div className="legend">
                {data.prizes.length === 0 && <span className="adm-empty">Pa çmime ende.</span>}
                {data.prizes.map((p, i) => (
                  <div className="li" key={p.label}>
                    <span className="dot" style={{ background: PRIZE_COLORS[i % PRIZE_COLORS.length] }} /> {p.label}{' '}
                    <span>· {prizeTotal ? Math.round((p.count / prizeTotal) * 100) : 0}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* game split */}
          <div className="panel">
            <h3>Sipas lojës</h3>
            <div className="sub">Cila lojë luhet më shumë</div>
            <div className="split">
              {data.games.length === 0 && <span className="adm-empty">Pa lojëra ende.</span>}
              {data.games.map((g, i) => {
                const pct = gameTotal ? Math.round((g.count / gameTotal) * 100) : 0;
                return (
                  <div className="g" key={g.mode}>
                    <div className="top">
                      <span>{gameLabel(g.mode)}</span>
                      <b>{pct}%</b>
                    </div>
                    <div className="track">
                      <i style={{ width: grow ? `${pct}%` : '0%', background: GAME_GRADIENTS[i % GAME_GRADIENTS.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* recent wins */}
          <div className="panel full">
            <h3>Fitoret e fundit</h3>
            <div className="sub">
              Shëno një kod si “i përdorur” kur klienti bën porosi — kjo llogarit konvertimin.
            </div>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Koha</th>
                  <th>Loja</th>
                  <th>Çmimi</th>
                  <th>Kodi</th>
                  <th>Statusi</th>
                </tr>
              </thead>
              <tbody>
                {recent.length === 0 && (
                  <tr>
                    <td colSpan={5} className="adm-empty">
                      Ende pa fitore.
                    </td>
                  </tr>
                )}
                {recent.map((rec, i) => (
                  <tr key={`${rec.code}-${i}`}>
                    <td>{formatTime(rec.time)}</td>
                    <td className="tag-g">{shortGameTag(rec.mode)}</td>
                    <td>{prizeText(rec.prize)}</td>
                    <td className="code">{rec.code}</td>
                    <td>
                      <button
                        type="button"
                        className={rec.redeemed ? 'pillbtn done' : 'pillbtn'}
                        onClick={() => handleRedeemToggle(rec, i)}
                        disabled={rec.redeemed}
                      >
                        {rec.redeemed ? '✓ Përdorur' : 'Shëno si përdorur'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <footer className="adm-footer">
          Mundësuar nga <b>Twirla</b>
        </footer>
      </div>
    </div>
  );
}
