import type { Role } from './types';

export const ROLE_ORDER: Role[] = ['anonymous', 'authenticated', 'editor', 'sitebuilder'];

export const ROLE_LABEL: Record<Role, string> = {
  anonymous: 'Anonymous',
  authenticated: 'Authenticated',
  editor: 'Editor',
  sitebuilder: 'Site Builder',
};

/** Plain-English explanation shown when a role is granted (for non-Drupal players). */
export const ROLE_EXPLAIN: Record<Role, string> = {
  anonymous: 'A visitor. You can look around, but most doors say "403".',
  authenticated: 'A logged-in member. You can now enter buildings and actually pick things up.',
  editor: 'You can create and edit content - and use the AI tools that help write it.',
  sitebuilder: 'You can configure the site itself: tools, agents, servers. The keys to the kingdom. Well, a keyring.',
};

export function roleRank(r: Role): number {
  return ROLE_ORDER.indexOf(r);
}

export function atLeast(current: Role, needed: Role): boolean {
  return roleRank(current) >= roleRank(needed);
}

const REFUSALS: Record<Role, string[]> = {
  anonymous: [
    '403. Access denied. I\'m Anonymous. I may look, but only at the parts they allow.',
    'Access denied. Apparently Anonymous users don\'t get to do that. Or anything.',
    'Nope. "You are not authorized to access this page." Story of my life.',
  ],
  authenticated: [
    'Access denied. I\'m only Authenticated. That gets me a profile picture and not much else.',
    'I need the Editor role for that. Being logged in isn\'t the same as being trusted.',
  ],
  editor: [
    'Editors edit. Builders build. I\'m an Editor. Configuring this needs the Site Builder role.',
    'Access denied: I can write content all day, but setting up tools needs Site Builder.',
  ],
  sitebuilder: ['Even a Site Builder can\'t do that. And Site Builders can do almost anything.'],
};

export function refusal(current: Role, needed: Role, n: number): string {
  const opts = REFUSALS[current] ?? REFUSALS.anonymous;
  const base = opts[n % opts.length];
  return needed === 'sitebuilder' && current !== 'editor'
    ? `${base} (Needs: ${ROLE_LABEL[needed]}.)`
    : base;
}
