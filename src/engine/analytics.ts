// Optional Google Analytics, web version only.
//
// Off unless env.json (next to index.html, from public/env.json) names a measurement id. Never in the
// desktop app (served from app://). When it is on, the web version opens on a start page: accept the
// privacy policy and play, or download the desktop app, which has no analytics. Google's script only
// loads after that yes. Saves never go anywhere either way.
import { showGate } from './overlays';

const CONSENT_KEY = 'mac-zakpackin:analytics'; // 'yes' once accepted; storing that needs no consent

export interface AnalyticsEnv {
  googleAnalyticsId: string;
  /** Who runs the site, for the privacy policy. */
  operator: string;
  /** How to reach them about privacy: an email address or a URL. */
  contact: string;
  /** Must match the data retention set in the GA admin. */
  dataRetentionMonths: number;
}

let config: AnalyticsEnv | null = null;
let loaded = false;

export const isDesktop = () => location.protocol === 'app:';

/** Analytics is set up for this build: there is a start page and a privacy policy. */
export const analyticsEnv = () => config;
export const analyticsAvailable = () => config !== null;
export const consented = () => loaded;

export async function initAnalytics() {
  if (isDesktop()) return;
  try {
    const env = await (await fetch('env.json', { cache: 'no-store' })).json();
    const id = typeof env?.googleAnalyticsId === 'string' ? env.googleAnalyticsId.trim() : '';
    if (!/^G-[A-Z0-9]{4,}$/.test(id)) return; // missing, empty or not a GA4 id: stay off
    const text = (v: unknown, d: string) => (typeof v === 'string' && v.trim() ? v.trim() : d);
    const months = Number(env.dataRetentionMonths);
    config = {
      googleAnalyticsId: id,
      operator: text(env.operator, 'Workflows of AI'),
      contact: text(env.contact, 'https://github.com/ivanboring/Mac-Packwala-and-the-curse-of-the-stale-cache/issues'),
      dataRetentionMonths: Number.isInteger(months) && months > 0 ? months : 2,
    };
  } catch { return; } // no env.json: stay off
  let yes = false;
  try { yes = localStorage.getItem(CONSENT_KEY) === 'yes'; } catch { /* no storage: ask every visit */ }
  if (yes) load();
  else showGate();
}

/** The big button on the start page. */
export function acceptAndPlay() {
  try { localStorage.setItem(CONSENT_KEY, 'yes'); } catch { /* no storage: asked again next visit */ }
  load();
}

/** Withdraw consent: stop sending, delete Google's cookies, and back to the start page. */
export function withdraw() {
  try { localStorage.removeItem(CONSENT_KEY); } catch { /* no storage */ }
  if (loaded) gtag('consent', 'update', { analytics_storage: 'denied' });
  const names = document.cookie.split(';').map((c) => c.split('=')[0].trim()).filter((n) => n.startsWith('_ga'));
  const parts = location.hostname.split('.');
  for (const n of names) {
    for (let i = 0; i < parts.length; i++) document.cookie = `${n}=; Max-Age=0; path=/; domain=.${parts.slice(i).join('.')}`;
    document.cookie = `${n}=; Max-Age=0; path=/`;
  }
  location.reload(); // drops gtag.js from the page too
}

/** A game event (room entered, item found, game finished...). Does nothing without consent. */
export function track(name: string, params: Record<string, string | number> = {}) {
  if (loaded) gtag('event', name, params);
}

function gtag(..._args: unknown[]) {
  // gtag.js reads the arguments object itself, not an array
  // eslint-disable-next-line prefer-rest-params
  ((window as any).dataLayer ??= []).push(arguments);
}

function load() {
  if (loaded || !config) return;
  loaded = true;
  gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  gtag('js', new Date());
  gtag('config', config.googleAnalyticsId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    cookie_expires: 13 * 30 * 24 * 60 * 60, // 13 months, not GA's default 2 years
  });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.googleAnalyticsId)}`;
  document.head.append(s);
}
