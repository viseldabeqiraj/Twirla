import type { RunnerFrameState } from './useRunnerGame';
import type { RunnerTheme } from './runnerTypes';
import { DEFAULT_RUNNER_THEME } from './runnerTypes';
import { CHARACTER_WIDTH, CHARACTER_HEIGHT } from './runnerConstants';
import type { Obstacle } from './runnerObstacles';

function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : null;
}

function drawObstacle(
  ctx: CanvasRenderingContext2D,
  obs: Obstacle,
  obstacleColor: string,
  highlight: string
) {
  const { x, y, width, height, kind } = obs;
  const cx = x + width / 2;

  ctx.fillStyle = obstacleColor;
  ctx.strokeStyle = 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1.5;

  if (kind === 'gift') {
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = highlight;
    ctx.fillRect(cx - 3, y, 6, height * 0.5);
    ctx.fillRect(x, y + height * 0.35, width, 5);
  } else if (kind === 'spike') {
    ctx.beginPath();
    ctx.moveTo(cx, y + height);
    ctx.lineTo(x, y + height);
    ctx.lineTo(cx, y);
    ctx.lineTo(x + width, y + height);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (kind === 'bag') {
    const handleW = width * 0.4;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + height);
    ctx.lineTo(x + width - 4, y + height);
    ctx.lineTo(x + width - 2, y + height * 0.4);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x + 2, y + height * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.beginPath();
    ctx.ellipse(cx - handleW / 2, y + 4, handleW / 2, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + handleW / 2, y + 4, handleW / 2, 5, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else {
    // tag (discount tag: rectangle with triangular notch)
    const notch = height * 0.25;
    ctx.beginPath();
    ctx.moveTo(x, y + notch);
    ctx.lineTo(x, y + height);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x + width, y + notch);
    ctx.lineTo(x + width / 2, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = highlight;
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('%', cx, y + height * 0.55);
  }
}

export function drawRunnerFrame(
  ctx: CanvasRenderingContext2D,
  frame: RunnerFrameState,
  theme: RunnerTheme = DEFAULT_RUNNER_THEME
) {
  const { width, height, characterY, obstacles, groundY, scorePopFrames = 0 } = frame;
  const accent = (theme.accent ?? DEFAULT_RUNNER_THEME.accent) as string;
  const highlight = (theme.highlight ?? DEFAULT_RUNNER_THEME.highlight) as string;
  const ground = (theme.ground ?? DEFAULT_RUNNER_THEME.ground) as string;
  const obstacleColor = (theme.obstacleColor ?? DEFAULT_RUNNER_THEME.obstacleColor) as string;

  ctx.clearRect(0, 0, width, height);

  const groundTop = groundY + CHARACTER_HEIGHT;
  const groundHeight = height - groundTop;
  const time = Date.now() / 1000;

  // Background gradient from theme (shop branding when provided)
  const gradOffset = Math.sin(time * 0.15) * 20;
  const bgGrad = ctx.createLinearGradient(0, gradOffset, 0, height + gradOffset);
  bgGrad.addColorStop(0, highlight);
  bgGrad.addColorStop(0.4 + Math.sin(time * 0.2) * 0.05, ground);
  bgGrad.addColorStop(1, ground);
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Clouds (soft, slow drift)
  const cloudBase = (t: number, seed: number) => (t * 8 + seed * 37) % (width + 80) - 40;
  const clouds = [
    { y: height * 0.15, scale: 1, seed: 0 },
    { y: height * 0.08, scale: 0.7, seed: 11 },
    { y: height * 0.22, scale: 0.85, seed: 23 },
    { y: height * 0.05, scale: 0.55, seed: 47 },
  ];
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  clouds.forEach((c) => {
    const x = cloudBase(time, c.seed);
    const w = 40 * c.scale;
    const h = 14 * c.scale;
    ctx.beginPath();
    ctx.ellipse(x, c.y, w * 0.5, h, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.4, c.y - h * 0.2, w * 0.4, h * 0.7, 0, 0, Math.PI * 2);
    ctx.ellipse(x + w * 0.75, c.y, w * 0.45, h * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  // Horizon line (accent with low opacity)
  const accentRgb = hexToRgb(accent);
  ctx.strokeStyle = accentRgb ? `rgba(${accentRgb.join(',')}, 0.12)` : 'rgba(219, 39, 119, 0.12)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, groundTop - 2);
  ctx.lineTo(width + 20, groundTop - 2);
  ctx.stroke();

  // Floating bubbles (more, slower)
  const t = time * 0.8;
  for (let i = 0; i < 9; i++) {
    const px = ((t * 25 + i * 47) % (width + 60)) - 30;
    const py = (groundTop - 50 - (i * 22) % 60) + Math.sin(t + i * 0.7) * 8;
    const alpha = 0.06 + (i % 3) * 0.04 + Math.sin(time * 2 + i) * 0.02;
    const highlightRgb = hexToRgb(highlight);
    const bubbleRgb = highlightRgb ? highlightRgb.join(',') : '244, 114, 182';
    ctx.fillStyle = `rgba(${bubbleRgb}, ${Math.max(0.04, alpha)})`;
    ctx.beginPath();
    ctx.arc(px, py, 5 + (i % 2) * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // Small sparkles (twinkle)
  for (let i = 0; i < 12; i++) {
    const sx = ((t * 15 + i * 31) % (width + 20)) - 10;
    const sy = (groundTop - 80 - (i * 13) % 70) + Math.cos(time * 1.5 + i * 0.5) * 5;
    const twinkle = (Math.sin(time * 4 + i * 1.2) + 1) * 0.5;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.15 * twinkle})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Ground band (soft strip)
  ctx.fillStyle = ground;
  ctx.beginPath();
  ctx.roundRect(0, groundTop, width + 20, groundHeight + 20, 12);
  ctx.fill();

  // Ground shadow (stronger band under ground line)
  ctx.fillStyle = 'rgba(0,0,0,0.08)';
  ctx.fillRect(0, groundTop, width, 6);
  ctx.fillStyle = 'rgba(0,0,0,0.04)';
  ctx.fillRect(0, groundTop + 6, width, 12);

  // Obstacles
  obstacles.forEach((obs) => drawObstacle(ctx, obs, obstacleColor, highlight));

  // Dust when jumping (velocity strongly upward)
  const { velocityY = 0 } = frame;
  if (velocityY < -5) {
    const charX = 52;
    const feetY = characterY + CHARACTER_HEIGHT;
    const t = Date.now() / 60;
    const alpha = Math.min(0.35, -velocityY / 40);
    for (let i = 0; i < 5; i++) {
      const dx = Math.sin(t + i * 1.2) * 6 + (i - 2) * 5;
      ctx.fillStyle = `rgba(100,70,70,${alpha * (1 - i * 0.15)})`;
      ctx.beginPath();
      ctx.arc(charX + 18 + dx, feetY + 2 + (i % 2) * 3, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // +1 score pop near character (floats up)
  const charX = 52;
  if (scorePopFrames > 0) {
    const popProgress = 1 - scorePopFrames / 28;
    const popY = characterY + CHARACTER_HEIGHT * 0.3 - popProgress * 35;
    const popAlpha = popProgress < 0.3 ? popProgress / 0.3 : 1 - (popProgress - 0.3) / 0.7;
    ctx.save();
    ctx.globalAlpha = popAlpha;
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = accent;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('+1', charX + CHARACTER_WIDTH / 2, popY);
    ctx.restore();
  }

  // Character: no bounce or squash, stable on ground
  const charY = characterY;
  const radius = 10;
  const drawX = charX;
  const drawY = charY;
  const drawWidth = CHARACTER_WIDTH;
  const drawHeight = CHARACTER_HEIGHT;

  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.roundRect(drawX, drawY, drawWidth, drawHeight, radius);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Blink: ~every 2.8s for 0.12s (deterministic from time)
  const now = Date.now();
  const blinkCycle = now % 2840;
  const eyesOpen = blinkCycle > 140;

  const eyeY = drawY + drawHeight * 0.35;
  const eyeLX = drawX + drawWidth * 0.33;
  const eyeRX = drawX + drawWidth * 0.67;
  if (eyesOpen) {
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(eyeLX, eyeY, 5, 0, Math.PI * 2);
    ctx.arc(eyeRX, eyeY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(eyeLX, eyeY, 2, 0, Math.PI * 2);
    ctx.arc(eyeRX, eyeY, 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(eyeLX - 4, eyeY);
    ctx.lineTo(eyeLX + 4, eyeY);
    ctx.moveTo(eyeRX - 4, eyeY);
    ctx.lineTo(eyeRX + 4, eyeY);
    ctx.stroke();
  }
}
