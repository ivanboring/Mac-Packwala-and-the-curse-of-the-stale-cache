// Pages over the game: About (from the menu, always), and in the web version with analytics set up
// (see analytics.ts), the start page and the privacy policy. Plain DOM over the canvas: long text
// reads better as HTML than in pixel font.
import { acceptAndPlay, analyticsAvailable, analyticsEnv, consented, isDesktop, withdraw } from './analytics';

declare const __APP_VERSION__: string;

export const REPO = 'https://github.com/ivanboring/Mac-Packwala-and-the-curse-of-the-stale-cache';
const latest = (file: string) => `${REPO}/releases/latest/download/${file}`;
export const DOWNLOADS = [
  { label: 'Windows', url: latest('Mac-Packwala-windows-setup.exe') },
  { label: 'macOS', url: latest('Mac-Packwala-mac-universal.dmg') },
  { label: 'Linux', url: latest('Mac-Packwala-linux-x86_64.AppImage') },
];

type Child = Node | string;
function el(tag: string, attrs: Record<string, string> = {}, ...children: Child[]) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  e.append(...children);
  return e;
}
const link = (href: string, text: string, cls = '') => el('a', { href, target: '_blank', rel: 'noopener', ...(cls ? { class: cls } : {}) }, text);
function button(text: string, cls: string, onClick: () => void) {
  const b = el('button', { type: 'button', class: cls }, text);
  b.addEventListener('click', onClick);
  return b;
}

/** Overlays stop the game's keyboard shortcuts (see game.ts). */
function open(overlay: HTMLElement) {
  document.body.append(overlay);
  document.body.classList.add('overlay-open');
  overlay.querySelector<HTMLElement>('.primary, button')?.focus();
}
function close(overlay: HTMLElement) {
  overlay.remove();
  if (!document.querySelector('.overlay')) document.body.classList.remove('overlay-open');
}

export function showGate() {
  const gate = el('div', { class: 'overlay gate', role: 'dialog', 'aria-labelledby': 'gate-title' });
  const play = () => { acceptAndPlay(); close(gate); };
  gate.append(el('div', { class: 'card' },
    el('p', { class: 'prompt' }, 'marcus@workflows:~$ ./play.sh'),
    el('h1', { id: 'gate-title' }, 'Mac Packwala and the Curse of the Stale Cache'),
    el('p', {}, 'A point-and-click adventure about Drupal AI. This web version uses Google Analytics to see which rooms players reach and where they get stuck.'),
    button('Accept the privacy policy and play', 'primary big', play),
    button('Read the privacy policy', 'textlink', () => showPolicy()),
    el('h2', {}, 'Rather not be tracked?'),
    el('p', {}, 'Download the game and play it on your own computer. The desktop version has no analytics.'),
    el('div', { class: 'downloads' }, ...DOWNLOADS.map((d) => link(d.url, d.label, 'button'))),
    el('p', { class: 'disclaimer' }, 'This game was vibe coded. Installing it locally is your own responsibility.'),
    link(`${REPO}#develop`, 'Set up with npm from the source repo', 'button small'),
  ));
  open(gate);
}

/** The privacy policy. From the start page it offers to accept; once accepted, to withdraw. */
export function showPolicy() {
  const env = analyticsEnv();
  if (!env) return;
  const policy = el('div', { class: 'overlay policy', role: 'dialog', 'aria-labelledby': 'policy-title' });
  const done = () => close(policy);
  const contact = /^[^@\s]+@[^@\s]+$/.test(env.contact) ? link(`mailto:${env.contact}`, env.contact) : link(env.contact, env.contact);
  const section = (title: string, ...body: Child[]) => [el('h2', {}, title), ...body];
  const p = (...c: Child[]) => el('p', {}, ...c);
  const ul = (...items: Child[]) => el('ul', {}, ...items.map((i) => el('li', {}, i)));

  const actions = consented()
    ? [button('Withdraw consent', '', withdraw), button('Back to the game', 'primary', done)]
    : [button('Back', '', done), button('Accept and play', 'primary', () => { done(); document.querySelector<HTMLButtonElement>('.gate .big')?.click(); })];

  policy.append(el('div', { class: 'card' },
    el('h1', { id: 'policy-title' }, 'Privacy policy'),
    p('This covers the web version of Mac Packwala and the Curse of the Stale Cache. The desktop version collects nothing.'),
    ...section('Who is responsible', p(`${env.operator}. Questions and requests: `, contact, '.')),
    ...section('What is collected, and why',
      p('Only if you accept, we use Google Analytics 4 to learn how the game is played, so we can fix the puzzles where players get stuck:'),
      ul('game started or continued', 'how far you get: each step of the puzzle chain you complete', 'rooms entered', 'items found and roles granted', 'game finished, with total play time'),
      p('Google Analytics also records the device, browser, screen size, language and an approximate location (country and city, worked out from your IP address; Google Analytics 4 does not store IP addresses). Google Signals, advertising and ad personalisation are switched off.')),
    ...section('Cookies', p('Google Analytics sets the cookies _ga and _ga_<id> with a random ID, to tell visits apart. They expire after 13 months, or when you withdraw consent.')),
    ...section('Legal basis', p('Your consent (GDPR Article 6(1)(a)). You can withdraw it at any time from the game menu: About, then Privacy policy. If you do not want to be tracked at all, the desktop version is the same game without analytics.')),
    ...section('Who receives the data',
      p('Google Ireland Ltd processes the data for us. Google may process it in the United States; Google LLC is certified under the EU-U.S. Data Privacy Framework. See ', link('https://policies.google.com/privacy', 'Google\'s privacy policy'), '.')),
    ...section('How long it is kept', p(`Google Analytics keeps the event data for ${env.dataRetentionMonths} months, then deletes it. Reports only show totals.`)),
    ...section('What stays on your device',
      p('Your saves, settings and this consent are stored in your browser\'s local storage. They are needed for the game to work and are never sent anywhere. Clear your browser\'s site data to delete them.')),
    ...section('Your rights',
      p('You can ask for access to, correction or deletion of your data, restrict or object to its use, and withdraw consent; contact us as above. You can also complain to your data protection authority.')),
    el('div', { class: 'actions' }, ...actions),
  ));
  policy.addEventListener('keydown', (e) => { if (e.key === 'Escape') done(); });
  open(policy);
}

/** About, from the game menu: downloads, privacy and the source code. */
export function showAbout() {
  const about = el('div', { class: 'overlay about', role: 'dialog', 'aria-labelledby': 'about-title' });
  const done = () => close(about);
  const privacy = analyticsAvailable()
    ? [el('p', {}, 'This web version uses Google Analytics, with your consent.'), button('Privacy policy', '', () => showPolicy())]
    : [el('p', {}, 'This version collects nothing. Your saves and settings stay on this device.')];
  about.append(el('div', { class: 'card' },
    el('h1', { id: 'about-title' }, 'About'),
    el('p', {}, `Mac Packwala and the Curse of the Stale Cache, version ${__APP_VERSION__}. A classic point-and-click adventure about Drupal AI, made for `,
      link('https://workflows-of-ai.com', 'workflows-of-ai.com'), '.'),
    el('p', {}, 'AI disclosure: this game was vibe coded with AI. Its music and voices were generated with ElevenLabs.'),
    el('h2', {}, isDesktop() ? 'Latest version' : 'Download'),
    el('p', {}, isDesktop() ? 'Get the newest desktop version:' : 'Play on your own computer, without analytics:'),
    el('div', { class: 'downloads' }, ...DOWNLOADS.map((d) => link(d.url, d.label, 'button'))),
    el('p', { class: 'disclaimer' }, 'This game was vibe coded. Installing it locally is your own responsibility.'),
    el('h2', {}, 'Privacy'),
    ...privacy,
    el('h2', {}, 'Source code'),
    el('p', {}, 'The game is open source: ', link(REPO, 'github.com/ivanboring/Mac-Packwala-and-the-curse-of-the-stale-cache'), '.'),
    link(`${REPO}#develop`, 'Set up with npm from the source repo', 'button small'),
    el('div', { class: 'actions' }, button('Back to the game', 'primary', done)),
  ));
  about.addEventListener('keydown', (e) => { if (e.key === 'Escape') done(); });
  open(about);
}
