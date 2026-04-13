import { getApiBase } from '../config/api';
import { getOrCreatePlaySessionId } from '../utils/playSession';

const getApiUrl = () => `${getApiBase()}/api`;

export type AnalyticsEventType =
  | 'page_view'
  | 'game_start'
  | 'game_finish'
  | 'reward_won'
  | 'reward_generated'
  | 'coupon_generated'
  | 'code_copied'
  | 'cta_clicked';

export interface TrackEventOptions {
  visitorId?: string;
  sessionId?: string;
  value?: number;
  mode?: string;
  couponCode?: string;
}

const VISITOR_KEY = 'twirla_visitor_id';

export function getOrCreateVisitorId(): string {
  let id = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem(VISITOR_KEY) : null;
  if (!id) {
    id = `v_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    try {
      sessionStorage.setItem(VISITOR_KEY, id);
    } catch {
      /* ignore */
    }
  }
  return id;
}

export async function trackEvent(
  shopId: string,
  event: AnalyticsEventType,
  options: TrackEventOptions = {}
): Promise<void> {
  const visitorId = options.visitorId ?? getOrCreateVisitorId();
  const sessionId = options.sessionId ?? getOrCreatePlaySessionId();
  const url = `${getApiUrl()}/shops/${encodeURIComponent(shopId)}/analytics/event`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event,
        visitorId,
        sessionId,
        value: options.value,
        mode: options.mode,
        couponCode: options.couponCode,
      }),
    });
  } catch {
    // Fire-and-forget; don't break the app
  }
}
