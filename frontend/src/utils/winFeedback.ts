/**
 * Win feedback — short WebAudio chime + haptic pulse fired alongside confetti
 * on every game win. Ported from the Twirla shop demo prototype. Both are
 * best-effort: browsers without WebAudio/vibration support silently no-op.
 */

const CHIME_NOTES = [523, 659, 784, 1047]; // C5, E5, G5, C6 — bright ascending arpeggio

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) audioCtx = new Ctx();
  return audioCtx;
}

/** Plays a short 4-note ascending chime. */
export function playWinChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') void ctx.resume();

    const now = ctx.currentTime;
    CHIME_NOTES.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);
      const t = now + i * 0.09;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.start(t);
      osc.stop(t + 0.45);
    });
  } catch {
    /* audio isn't critical to the win moment — fail silently */
  }
}

/** Short haptic pulse pattern on devices/browsers that support it. */
export function vibrateWin(): void {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([30, 40, 60]);
    }
  } catch {
    /* ignore */
  }
}

/** Fire both win cues together — call once per win, alongside the confetti burst. */
export function fireWinFeedback(): void {
  playWinChime();
  vibrateWin();
}
