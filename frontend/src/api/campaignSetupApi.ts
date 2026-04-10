import { getApiBase } from '../config/api';

function apiPrefix(): string {
  const b = getApiBase();
  return b ? `${b.replace(/\/$/, '')}/api` : '/api';
}

/** Stored after successful POST /api/setup/campaign/unlock; sent as Bearer for session checks. */
export const CAMPAIGN_SETUP_TOKEN_KEY = 'twirla_campaign_setup_token_v1';

export async function unlockCampaignSetup(code: string): Promise<{ token: string; expiresInSeconds?: number }> {
  const res = await fetch(`${apiPrefix()}/setup/campaign/unlock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code }),
  });
  if (res.status === 503) {
    throw new Error('NOT_CONFIGURED');
  }
  if (!res.ok) {
    throw new Error('INVALID_CODE');
  }
  const data = (await res.json()) as { token?: string };
  if (!data?.token) {
    throw new Error('INVALID_CODE');
  }
  return { token: data.token, expiresInSeconds: (data as { expiresInSeconds?: number }).expiresInSeconds };
}

export async function validateCampaignSetupSession(token: string): Promise<boolean> {
  const res = await fetch(`${apiPrefix()}/setup/campaign/session`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok;
}
