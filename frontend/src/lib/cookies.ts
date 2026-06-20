export type CookieConsent = 'accepted' | 'rejected';
const KEY = 'pm_cookie_consent';

export function getConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null;
  const v = localStorage.getItem(KEY);
  return v === 'accepted' || v === 'rejected' ? v : null;
}

export function setConsent(value: CookieConsent) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, value);
  window.dispatchEvent(new Event('pm-consent-change'));
}

// Úsalo en el futuro para envolver scripts de analítica:
// if (hasAnalyticsConsent()) { /* cargar GA / Vercel Analytics */ }
export function hasAnalyticsConsent(): boolean {
  return getConsent() === 'accepted';
}