import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ShopConfig } from '../../types/ShopConfig';
import { recordPlay } from '../../utils/playTracking';
import { trackEvent } from '../../api/analyticsApi';
import { useTranslation } from '../../i18n/i18n';
import Confetti from '../Confetti';
import RewardModal from '../twirla-ui/RewardModal';
import PrimaryButton from '../twirla-ui/PrimaryButton';
import { generateDiscountCode, persistRewardCodeMeta } from '../../utils/discountCode';
import './MemoryMatchExperience.css';

const DEFAULT_SYMBOLS = ['🎁', '🎯', '✨', '🏃', '💝', '⭐', '🎀', '🔔'];

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

interface CardModel {
  id: string;
  pairId: number;
  label: string;
}

function buildDeck(memory: NonNullable<ShopConfig['memory']>): CardModel[] {
  const raw = memory.pairCount;
  const pairCount = Math.min(8, Math.max(3, Number.isFinite(raw) ? Math.floor(raw) : 6));
  const labels =
    memory.pairLabels && memory.pairLabels.length >= pairCount
      ? memory.pairLabels.slice(0, pairCount)
      : DEFAULT_SYMBOLS.slice(0, pairCount);

  const pairs: CardModel[] = [];
  for (let p = 0; p < pairCount; p++) {
    const label = labels[p] ?? DEFAULT_SYMBOLS[p % DEFAULT_SYMBOLS.length];
    pairs.push({ id: `${p}-a`, pairId: p, label }, { id: `${p}-b`, pairId: p, label });
  }
  return shuffle(pairs);
}

function formatElapsed(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  return m > 0 ? `${m}:${r.toString().padStart(2, '0')}` : `${r}s`;
}

interface MemoryMatchExperienceProps {
  config: ShopConfig;
}

export default function MemoryMatchExperience({ config }: MemoryMatchExperienceProps) {
  const { memory, shopId, branding, cta, text } = config;
  const { t } = useTranslation();
  const [started, setStarted] = useState(false);
  const [cards, setCards] = useState<CardModel[]>(() => (memory ? buildDeck(memory) : []));
  const [matched, setMatched] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<string[]>([]);
  const [won, setWon] = useState(false);
  const [lost, setLost] = useState(false);
  const [lostReason, setLostReason] = useState<'time' | 'mistakes' | null>(null);
  const [busy, setBusy] = useState(false);
  const [wrongPair, setWrongPair] = useState<string[]>([]);
  const [clockMs, setClockMs] = useState(0);
  const [finalClockMs, setFinalClockMs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const startedTracked = useRef(false);
  const winRecorded = useRef(false);
  const lostRecorded = useRef(false);
  const gameStartRef = useRef<number | null>(null);
  const [finishCode, setFinishCode] = useState<string | null>(null);

  const totalPairs = useMemo(() => {
    if (!memory) return 0;
    return Math.min(8, Math.max(3, Math.floor(memory.pairCount)));
  }, [memory]);

  const timeLimitSec = memory?.timeLimitSeconds;
  const maxMistakes = memory?.maxMistakes;

  const matchedPairCount = useMemo(
    () => Object.values(matched).filter(Boolean).length / 2,
    [matched]
  );

  useEffect(() => {
    if (!started || won || lost) return;
    const id = window.setInterval(() => {
      if (!gameStartRef.current) return;
      setClockMs(Date.now() - gameStartRef.current);
    }, 200);
    return () => window.clearInterval(id);
  }, [started, won, lost]);

  useEffect(() => {
    if (!started || won || lost) return;
    if (timeLimitSec == null || timeLimitSec <= 0) return;
    if (matchedPairCount >= totalPairs) return;
    if (clockMs >= timeLimitSec * 1000) {
      setLost(true);
      setLostReason('time');
      setBusy(false);
      setSelected([]);
    }
  }, [clockMs, started, won, lost, timeLimitSec, matchedPairCount, totalPairs]);

  useEffect(() => {
    if (!started || won || lost) return;
    if (maxMistakes == null || maxMistakes <= 0) return;
    if (mistakes >= maxMistakes) {
      setLost(true);
      setLostReason('mistakes');
      setBusy(false);
      setSelected([]);
    }
  }, [mistakes, maxMistakes, started, won, lost]);

  useEffect(() => {
    if (!started || won || winRecorded.current || lost) return;
    if (matchedPairCount < totalPairs || totalPairs === 0) return;
    winRecorded.current = true;
    if (gameStartRef.current) {
      setFinalClockMs(Date.now() - gameStartRef.current);
    }
    setWon(true);
    const code = generateDiscountCode({
      shopSlug: config.slug ?? shopId,
      shopId,
      gameMode: 'MemoryMatch',
    });
    setFinishCode(code);
    persistRewardCodeMeta({ code, generatedAt: Date.now(), shopId, game: 'MemoryMatch' });
    trackEvent(shopId, 'game_finish', { mode: 'MemoryMatch' });
    trackEvent(shopId, 'reward_won', { mode: 'MemoryMatch' });
    trackEvent(shopId, 'reward_generated', { mode: 'MemoryMatch', couponCode: code });
    recordPlay(shopId);
  }, [started, won, lost, matchedPairCount, totalPairs, shopId, config.slug]);

  const resetGame = useCallback(() => {
    if (!memory) return;
    setCards(buildDeck(memory));
    setMatched({});
    setSelected([]);
    setWon(false);
    setLost(false);
    setLostReason(null);
    setBusy(false);
    setWrongPair([]);
    setClockMs(0);
    setFinalClockMs(0);
    setMoves(0);
    setMistakes(0);
    gameStartRef.current = null;
    startedTracked.current = false;
    winRecorded.current = false;
    lostRecorded.current = false;
    setFinishCode(null);
    setStarted(false);
  }, [memory]);

  useEffect(() => {
    if (!started || !lost || lostRecorded.current) return;
    lostRecorded.current = true;
    const code = generateDiscountCode({
      shopSlug: config.slug ?? shopId,
      shopId,
      gameMode: 'MemoryMatch',
    });
    setFinishCode(code);
    persistRewardCodeMeta({ code, generatedAt: Date.now(), shopId, game: 'MemoryMatch' });
    trackEvent(shopId, 'game_finish', { mode: 'MemoryMatch' });
    trackEvent(shopId, 'reward_won', { mode: 'MemoryMatch' });
    trackEvent(shopId, 'reward_generated', { mode: 'MemoryMatch', couponCode: code });
    recordPlay(shopId);
  }, [started, lost, shopId, config.slug]);

  const handleStart = () => {
    gameStartRef.current = Date.now();
    setClockMs(0);
    setMoves(0);
    setMistakes(0);
    setStarted(true);
    if (!startedTracked.current) {
      startedTracked.current = true;
      trackEvent(shopId, 'game_start', { mode: 'MemoryMatch' });
    }
  };

  const tryResolvePair = useCallback(
    (pair: [string, string]) => {
      const [a, b] = pair;
      const cardA = cards.find((c) => c.id === a);
      const cardB = cards.find((c) => c.id === b);
      if (!cardA || !cardB) {
        setSelected([]);
        return;
      }
      setMoves((m) => m + 1);
      if (cardA.pairId === cardB.pairId) {
        setMatched((m) => ({ ...m, [a]: true, [b]: true }));
        setSelected([]);
      } else {
        setMistakes((m) => m + 1);
        setWrongPair([a, b]);
        setBusy(true);
        window.setTimeout(() => {
          setSelected([]);
          setWrongPair([]);
          setBusy(false);
        }, 700);
      }
    },
    [cards]
  );

  const onCardClick = (id: string) => {
    if (!started || won || lost || busy) return;
    if (matched[id]) return;
    if (selected.includes(id)) return;
    if (selected.length >= 2) return;

    const next = [...selected, id];
    setSelected(next);
    if (next.length === 2) {
      tryResolvePair([next[0], next[1]]);
    }
  };

  if (!memory) return null;

  const faceUp = (id: string) => matched[id] || selected.includes(id);
  const remainingSec =
    timeLimitSec != null && timeLimitSec > 0
      ? Math.max(0, Math.ceil(timeLimitSec - clockMs / 1000))
      : null;

  return (
    <div
      className={`memory-match-wrap ${won ? 'memory-match-ended' : ''} ${lost ? 'memory-match-ended' : ''}`}
      style={
        {
          '--mm-primary': branding.primaryColor,
          '--mm-secondary': branding.secondaryColor,
          '--mm-accent': branding.accentColor ?? branding.primaryColor,
        } as React.CSSProperties
      }
    >
      {!started && (
        <div className="memory-match-intro">
          <p className="memory-match-intro-text">{t('memoryMatch.instruction')}</p>
          {(timeLimitSec != null && timeLimitSec > 0) || (maxMistakes != null && maxMistakes > 0) ? (
            <ul className="memory-match-rules">
              {timeLimitSec != null && timeLimitSec > 0 ? (
                <li>{t('memoryMatch.ruleTimeLimit', { seconds: String(timeLimitSec) })}</li>
              ) : null}
              {maxMistakes != null && maxMistakes > 0 ? (
                <li>{t('memoryMatch.ruleMaxMistakes', { max: String(maxMistakes) })}</li>
              ) : null}
              <li>{t('memoryMatch.ruleMoves')}</li>
            </ul>
          ) : null}
          <button type="button" className="memory-match-start" onClick={handleStart}>
            {t('memoryMatch.start')}
          </button>
        </div>
      )}

      {started && !won && !lost && (
        <>
          <div className="memory-match-hud" aria-live="polite">
            <span className="memory-match-hud-item">
              {t('memoryMatch.pairsFound', { current: String(matchedPairCount), total: String(totalPairs) })}
            </span>
            {remainingSec != null ? (
              <span
                className={`memory-match-hud-item memory-match-hud-item--time ${remainingSec <= 10 ? 'memory-match-hud-item--urgent' : ''}`}
              >
                {t('memoryMatch.timeLeft', { seconds: String(remainingSec) })}
              </span>
            ) : (
              <span className="memory-match-hud-item">{t('memoryMatch.timeElapsed', { time: formatElapsed(clockMs) })}</span>
            )}
            <span className="memory-match-hud-item">{t('memoryMatch.movesCount', { n: String(moves) })}</span>
            <span className="memory-match-hud-item">
              {maxMistakes != null && maxMistakes > 0
                ? t('memoryMatch.mistakesOfMax', { n: String(mistakes), max: String(maxMistakes) })
                : t('memoryMatch.mistakesCount', { n: String(mistakes) })}
            </span>
          </div>
          <div className="memory-match-grid" role="grid" aria-label={t('memoryMatch.gridLabel')}>
            {cards.map((card) => {
              const up = faceUp(card.id);
              const wrong = wrongPair.includes(card.id);
              return (
                <button
                  key={card.id}
                  type="button"
                  role="gridcell"
                  aria-pressed={up}
                  aria-label={up ? card.label : t('memoryMatch.cardHidden')}
                  disabled={won || lost || matched[card.id] || busy}
                  className={`memory-card ${up ? 'memory-card--up' : ''} ${matched[card.id] ? 'memory-card--matched' : ''} ${wrong ? 'memory-card--wrong' : ''}`}
                  onClick={() => onCardClick(card.id)}
                >
                  <span className="memory-card-inner">
                    <span className="memory-card-back" aria-hidden />
                    <span className="memory-card-front" aria-hidden>
                      {card.label}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <button type="button" className="memory-match-reset" onClick={resetGame}>
            {t('memoryMatch.reset')}
          </button>
        </>
      )}

      {lost && (
        <div className="memory-match-lose">
          <Confetti count={20} />
          <RewardModal
            title={t('reward.consolationHeadline', { pct: String(5) })}
            description={`${lostReason === 'time' ? t('memoryMatch.loseTime') : t('memoryMatch.loseMistakes')} ${t('memoryMatch.consolationCarry', { text: memory.revealText })}`}
            discountCode={finishCode}
            ctaUrl={cta.url}
            ctaLabel={text.ctaText}
            copyLabel={t('campaign.copyCode')}
            copiedLabel={t('reward.copied')}
            shopId={shopId}
            gameMode="MemoryMatch"
            extraActions={
              <PrimaryButton type="button" variant="ghost" block onClick={resetGame}>
                {t('memoryMatch.playAgain')}
              </PrimaryButton>
            }
          />
          <p className="memory-match-lose-stats memory-match-lose-stats--muted">
            {t('memoryMatch.loseStats', {
              time: formatElapsed(clockMs),
              moves: String(moves),
              mistakes: String(mistakes),
            })}
          </p>
        </div>
      )}

      {won && (
        <div className="memory-match-win">
          <Confetti count={36} />
          <RewardModal
            title={text.resultTitle}
            description={[text.resultSubtitle, memory.revealText, memory.revealSubtitle].filter(Boolean).join(' · ')}
            discountCode={finishCode}
            ctaUrl={cta.url}
            ctaLabel={text.ctaText}
            copyLabel={t('campaign.copyCode')}
            copiedLabel={t('reward.copied')}
            shopId={shopId}
            gameMode="MemoryMatch"
            extraActions={
              <>
                <dl className="memory-match-stats">
                  <div className="memory-match-stat">
                    <dt>{t('memoryMatch.statTime')}</dt>
                    <dd>{formatElapsed(finalClockMs)}</dd>
                  </div>
                  <div className="memory-match-stat">
                    <dt>{t('memoryMatch.statMoves')}</dt>
                    <dd>{moves}</dd>
                  </div>
                  <div className="memory-match-stat">
                    <dt>{t('memoryMatch.statMistakes')}</dt>
                    <dd>{mistakes}</dd>
                  </div>
                </dl>
                <PrimaryButton type="button" variant="ghost" block onClick={resetGame}>
                  {t('memoryMatch.playAgain')}
                </PrimaryButton>
              </>
            }
          />
        </div>
      )}
    </div>
  );
}
