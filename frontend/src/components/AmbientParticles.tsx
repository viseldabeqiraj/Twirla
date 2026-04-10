import { useMemo, type CSSProperties } from 'react';
import type { AmbientParticlesConfig } from '../types/ShopConfig';
import './AmbientParticles.css';

interface AmbientParticlesProps {
  shopId: string;
  particles: AmbientParticlesConfig;
  /** Fallback when `particles.color` / `accentColor` omitted */
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) || 1;
}

function frac(seed: number, i: number): number {
  const x = Math.sin(seed * 0.001 + i * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export default function AmbientParticles({
  shopId,
  particles,
  primaryColor,
  secondaryColor,
  accentColor,
}: AmbientParticlesProps) {
  const shape = particles.shape ?? 'orb';
  const density = particles.density ?? 'few';
  const count = density === 'some' ? 10 : 6;

  const fill = particles.color ?? primaryColor;
  const fill2 = particles.accentColor ?? accentColor ?? secondaryColor;

  const items = useMemo(() => {
    const seed = hashString(shopId);
    return Array.from({ length: count }, (_, i) => ({
      leftPct: 4 + frac(seed, i * 2) * 88,
      topPct: 6 + frac(seed, i * 2 + 1) * 78,
      sizePx:
        shape === 'dot' ? 3 + (i % 3) : shape === 'ring' ? 10 + (i % 4) * 2 : 14 + (i % 3) * 4,
      delayS: (i * 0.55) % 4.2,
      durationS: 14 + (i % 5) * 2.2,
      tone: i % 2 === 0 ? fill : fill2,
    }));
  }, [shopId, count, fill, fill2, shape]);

  return (
    <div className="ambient-particles" aria-hidden>
      {items.map((p, i) => (
        <span
          key={i}
          className={`ambient-particle ambient-particle--${shape}`}
          style={
            {
              left: `${p.leftPct}%`,
              top: `${p.topPct}%`,
              width: p.sizePx,
              height: p.sizePx,
              ['--particle-tone' as string]: p.tone,
              animationDelay: `${p.delayS}s`,
              animationDuration: `${p.durationS}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
