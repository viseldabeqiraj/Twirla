import { useEffect, useMemo, useRef, useState } from 'react';
import './GameStatsBar.css';

export interface StatItem {
  label: string;
  value: string;
  urgent?: boolean;
}

interface GameStatsBarProps {
  items: StatItem[];
  /** 0–100 optional progress */
  progress?: number | null;
  progressCaption?: string | null;
}

export default function GameStatsBar({ items, progress, progressCaption }: GameStatsBarProps) {
  const pct = progress == null ? null : Math.max(0, Math.min(100, progress));
  const prevValuesRef = useRef<Record<string, string>>({});
  const [bumpLabels, setBumpLabels] = useState<Set<string>>(() => new Set());
  const valuesSignature = useMemo(
    () => items.map((it) => `${it.label}:${it.value}`).join('\n'),
    [items]
  );
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    const prev = prevValuesRef.current;
    const changed = new Set<string>();
    for (const it of itemsRef.current) {
      const was = prev[it.label];
      if (was !== undefined && was !== it.value) {
        changed.add(it.label);
      }
      prev[it.label] = it.value;
    }
    if (!changed.size) return;
    setBumpLabels(changed);
    const t = window.setTimeout(() => setBumpLabels(new Set()), 280);
    return () => window.clearTimeout(t);
  }, [valuesSignature]);
  return (
    <div className="tw-stats-bar" role="group">
      {items.map((it) => (
        <span key={it.label} className="tw-stats-bar__item">
          <span className="tw-stats-bar__label">{it.label}</span>
          <span
            className={[
              'tw-stats-bar__value',
              it.urgent ? 'tw-stats-bar__value--urgent' : '',
              bumpLabels.has(it.label) ? 'tw-stats-bar__value--bump' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {it.value}
          </span>
        </span>
      ))}
      {pct != null && (
        <div className="tw-stats-bar__progress">
          <div className="tw-stats-bar__progress-track" aria-hidden>
            <div className="tw-stats-bar__progress-fill" style={{ width: `${pct}%` }} />
          </div>
          {progressCaption ? <p className="tw-stats-bar__progress-caption">{progressCaption}</p> : null}
        </div>
      )}
    </div>
  );
}
