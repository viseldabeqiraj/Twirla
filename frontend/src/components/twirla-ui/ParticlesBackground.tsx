import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { ParticlesBackgroundConfig } from '../../types/ShopLandingConfig';
import './ParticlesBackground.css';

/** Deterministic pseudo-random for stable layouts per shop */
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

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbDistance(
  a: { r: number; g: number; b: number },
  b: { r: number; g: number; b: number },
): number {
  return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
}

type Rgb = { r: number; g: number; b: number };

type Particle = { x: number; y: number; vx: number; vy: number; paletteIndex: 0 | 1 | 2 };

export interface ParticlesBackgroundProps {
  shopSlug: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  /** Higher contrast on light page backgrounds */
  backgroundMode?: 'light' | 'dark';
  config: ParticlesBackgroundConfig;
}

/**
 * Linked floating particles behind shop landing content.
 * Visual language similar to [React Bits — Particles](https://reactbits.dev/backgrounds/particles).
 */
export default function ParticlesBackground({
  shopSlug,
  primaryColor,
  secondaryColor,
  accentColor,
  backgroundMode = 'light',
  config,
}: ParticlesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();
  const particlesRef = useRef<Particle[]>([]);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });

  const count = Math.min(96, Math.max(20, Math.round(config.count ?? 52)));
  const linkDistance = config.linkDistance ?? 148;
  /** Radius in CSS px — defaults slightly smaller than “hero” size but still visible on theme backgrounds. */
  const dotRadius = Math.max(2.05, config.dotSize ?? 2.72);
  const speedMul = Math.min(1.35, Math.max(0.15, config.speed ?? 0.42));
  const colorA = config.color ?? primaryColor;
  const colorB = config.accentColor ?? accentColor ?? secondaryColor;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fallback = { r: 244, g: 114, b: 182 };
    /** Primary dot / link tint (particle `color` or shop primary). */
    const rgbPrimary = parseHex(colorA) ?? fallback;
    /** Shop page secondary — wash / second brand tone. */
    let rgbSecondary = parseHex(secondaryColor) ?? rgbPrimary;
    /** Accent / particle `accentColor` chain — third tone from the page or campaign JSON. */
    let rgbAccent = parseHex(colorB) ?? parseHex(accentColor ?? secondaryColor) ?? rgbPrimary;

    if (rgbDistance(rgbSecondary, rgbAccent) < 36) {
      rgbAccent = {
        r: Math.round((rgbPrimary.r + rgbSecondary.r) / 2),
        g: Math.round((rgbPrimary.g + rgbSecondary.g) / 2),
        b: Math.round((rgbPrimary.b + rgbSecondary.b) / 2),
      };
    }
    if (rgbDistance(rgbPrimary, rgbSecondary) < 28) {
      rgbSecondary = {
        r: Math.min(255, rgbPrimary.r + 22),
        g: Math.max(0, rgbPrimary.g - 8),
        b: Math.min(255, rgbPrimary.b + 18),
      };
    }

    const palette: [Rgb, Rgb, Rgb] = [rgbPrimary, rgbSecondary, rgbAccent];

    const isLight = backgroundMode !== 'dark';
    const linkStrokeAlpha = isLight ? 0.4 : 0.22;
    const dotFillAlpha = isLight ? 0.92 : 0.55;
    const linkLineWidth = isLight ? 1.25 : 0.95;

    const seed = hashString(shopSlug);
    const initParticles = (w: number, h: number) => {
      particlesRef.current = Array.from({ length: count }, (_, i) => ({
        x: frac(seed, i * 2) * w,
        y: frac(seed, i * 2 + 1) * h,
        vx: (frac(seed, i + 17) - 0.5) * 0.35 * speedMul,
        vy: (frac(seed, i + 31) - 0.5) * 0.35 * speedMul,
        paletteIndex: Math.min(2, Math.floor(frac(seed, i + 99) * 3)) as 0 | 1 | 2,
      }));
    };

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      const w = rect?.width ?? window.innerWidth;
      const h = Math.max(rect?.height ?? window.innerHeight, 400);
      const dpr = Math.min(window.devicePixelRatio ?? 1, 2);
      sizeRef.current = { w, h, dpr };
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles(w, h);
    };

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    window.addEventListener('resize', resize);

    let raf = 0;
    const step = () => {
      const { w, h } = sizeRef.current;
      if (w < 2 || h < 2) {
        raf = requestAnimationFrame(step);
        return;
      }

      if (particlesRef.current.length === 0) {
        initParticles(w, h);
      }
      const pts = particlesRef.current;

      ctx.clearRect(0, 0, w, h);

      if (!reduceMotion) {
        for (const p of pts) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0) p.x = w;
          if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h;
          if (p.y > h) p.y = 0;
        }
      }

      if (linkDistance > 0) {
        const d2 = linkDistance * linkDistance;
        for (let i = 0; i < pts.length; i++) {
          for (let j = i + 1; j < pts.length; j++) {
            const dx = pts[i].x - pts[j].x;
            const dy = pts[i].y - pts[j].y;
            const dist2 = dx * dx + dy * dy;
            if (dist2 < d2 && dist2 > 1) {
              const alpha = (1 - Math.sqrt(dist2) / linkDistance) * linkStrokeAlpha;
              const cI = palette[pts[i].paletteIndex];
              const cJ = palette[pts[j].paletteIndex];
              const rm = Math.round((cI.r + cJ.r) / 2);
              const gm = Math.round((cI.g + cJ.g) / 2);
              const bm = Math.round((cI.b + cJ.b) / 2);
              ctx.strokeStyle = `rgba(${rm},${gm},${bm},${alpha})`;
              ctx.lineWidth = linkLineWidth;
              ctx.beginPath();
              ctx.moveTo(pts[i].x, pts[i].y);
              ctx.lineTo(pts[j].x, pts[j].y);
              ctx.stroke();
            }
          }
        }
      }

      for (const p of pts) {
        const rgb = palette[p.paletteIndex];
        const r = dotRadius;
        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${dotFillAlpha * 0.32})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r + 1.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${dotFillAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduceMotion) {
        raf = requestAnimationFrame(step);
      }
    };

    if (reduceMotion) {
      resize();
      step();
    } else {
      raf = requestAnimationFrame(step);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', resize);
    };
  }, [
    shopSlug,
    count,
    linkDistance,
    dotRadius,
    speedMul,
    colorA,
    colorB,
    secondaryColor,
    accentColor,
    backgroundMode,
    reduceMotion,
  ]);

  const toneClass =
    backgroundMode === 'dark' ? 'tw-particles-bg--dark' : 'tw-particles-bg--light';

  return (
    <div className={`tw-particles-bg ${toneClass}`} aria-hidden>
      <canvas ref={canvasRef} className="tw-particles-bg__canvas" />
    </div>
  );
}
