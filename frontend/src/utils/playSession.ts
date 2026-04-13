const SESSION_KEY = 'twirla_play_session_id';

/** Per browser tab session for analytics correlation. */
export function getOrCreatePlaySessionId(): string {
  if (typeof sessionStorage === 'undefined') {
    return `s_${Date.now()}`;
  }
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    try {
      sessionStorage.setItem(SESSION_KEY, id);
    } catch {
      /* ignore */
    }
  }
  return id;
}
