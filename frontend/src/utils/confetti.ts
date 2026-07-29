/**
 * Realistic confetti — a faithful port of the canvas burst used in the Twirla
 * HTML prototypes. Rectangular paper strips launched upward from a point, with
 * gravity, spin and fade. One shared full-screen canvas is reused across the
 * whole app, and concurrent bursts simply add more particles to the same loop.
 */

const DEFAULT_COLORS = ['#FF2E9A', '#8A25C9', '#F6D67B', '#ffffff', '#38E1FF'];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  g: number;
  s: number;
  c: string;
  a: number;
  rot: number;
  vr: number;
}

export interface ConfettiOptions {
  /** Number of particles in this burst. Default 150 (matches the HTML). */
  count?: number;
  /** Horizontal origin as a 0–1 ratio of the viewport width. Default 0.5. */
  originXRatio?: number;
  /** Vertical origin as a 0–1 ratio of the viewport height. Default 0.45. */
  originYRatio?: number;
  /** Override the confetti palette. */
  colors?: string[];
}

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let particles: Particle[] = [];
let running = false;
let resizeBound = false;

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

function sizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function ensureCanvas() {
  if (canvas && ctx) return;
  canvas = document.createElement('canvas');
  canvas.id = 'tw-confetti-canvas';
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '9999',
  } as CSSStyleDeclaration);
  document.body.appendChild(canvas);
  ctx = canvas.getContext('2d');
  sizeCanvas();
  if (!resizeBound) {
    window.addEventListener('resize', sizeCanvas);
    resizeBound = true;
  }
}

function loop() {
  if (!canvas || !ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const p of particles) {
    p.vy += p.g;
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.a -= 0.008;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = Math.max(p.a, 0);
    ctx.fillStyle = p.c;
    ctx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 1.6);
    ctx.restore();
  }
  particles = particles.filter((p) => p.a > 0 && p.y < canvas!.height + 40);
  if (particles.length > 0) {
    requestAnimationFrame(loop);
  } else {
    running = false;
  }
}

/** Fire a celebratory confetti burst. Safe to call repeatedly. */
export function fireConfetti(options: ConfettiOptions = {}): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  if (prefersReducedMotion()) return;

  const { count = 150, originXRatio = 0.5, originYRatio = 0.45, colors = DEFAULT_COLORS } = options;

  ensureCanvas();
  const ox = window.innerWidth * originXRatio;
  const oy = window.innerHeight * originYRatio;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: ox,
      y: oy,
      vx: (Math.random() - 0.5) * 13,
      vy: Math.random() * -13 - 4,
      g: 0.4,
      s: Math.random() * 7 + 3,
      c: colors[i % colors.length],
      a: 1,
      rot: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.4,
    });
  }

  if (!running) {
    running = true;
    requestAnimationFrame(loop);
  }
}
