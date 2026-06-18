import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CAMPAIGN_SETUP_TOKEN_KEY, validateCampaignSetupSession } from '../api/campaignSetupApi';

export function getSetupSessionToken(): string | null {
  try {
    return sessionStorage.getItem(CAMPAIGN_SETUP_TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Validates campaign/shop-builder session; redirects to gate when missing or invalid. */
export function useSetupSession(gatePath = '/setup/shop-builder'): {
  ready: boolean;
  sessionToken: string | null;
} {
  const navigate = useNavigate();
  const [state, setState] = useState<'pending' | 'ok' | 'fail'>('pending');
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = getSetupSessionToken();
      if (!token) {
        if (!cancelled) setState('fail');
        return;
      }
      const ok = await validateCampaignSetupSession(token);
      if (!cancelled) {
        setState(ok ? 'ok' : 'fail');
        if (ok) setSessionToken(token);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (state === 'fail') {
      navigate(gatePath, { replace: true });
    }
  }, [state, navigate, gatePath]);

  return { ready: state === 'ok', sessionToken };
}
