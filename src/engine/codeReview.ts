// Code review: a reviewer shows a patch, and Mac writes the one comment that names its real bug.
// He can only write that comment for bugs he has learned, and he learns a bug by missing it:
// the reviewer then explains it. Wrong comments are bikeshedding, rubber stamps and nits.
import type { DuelDef, GameCore, PatchDef } from './core';

export const NOTHING = "I... can't see anything wrong?";

function shuffle<T>(g: GameCore, list: readonly T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = g.random([...Array(i + 1).keys()]);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** The patches a review goes through: all of a reviewer's, or four of the Master's and her stale cache. */
function patchesFor(g: GameCore, def: DuelDef): PatchDef[] {
  const mine = g.content.patches.filter((p) => p.who === def.opponent);
  if (!def.master) return shuffle(g, mine);
  const last = mine.filter((p) => p.bug === 'cache');
  return [...shuffle(g, mine.filter((p) => p.bug !== 'cache')).slice(0, 4), ...last];
}

export async function runReview(g: GameCore, def: DuelDef): Promise<boolean> {
  const who = def.opponent;
  const allowed = def.mistakes ?? 0;
  let missed = 0;
  for (const patch of patchesFor(g, def)) {
    const bug = g.content.bugs.find((b) => b.id === patch.bug)!;
    const known = !!g.flag(`bug:${bug.id}`);
    await g.sayAs(who, patch.intro);
    const options = shuffle(g, [
      ...(known ? [{ id: `bug:${bug.id}`, text: bug.comment }] : []),
      ...patch.decoys.map((d, i) => ({ id: `decoy:${i}`, text: d.text })),
    ]);
    options.push({ id: 'nothing', text: NOTHING });
    await g.fx('patch', [patch.title, ...patch.code]);
    const pick = await g.choose(options);
    await g.fx('patch', null);
    await g.say(options.find((o) => o.id === pick)!.text);
    if (pick === `bug:${bug.id}`) {
      await g.sayAs(who, patch.yes);
      continue;
    }
    const decoy = pick.startsWith('decoy:') ? patch.decoys[Number(pick.slice(6))] : null;
    if (decoy) await g.sayAs(who, decoy.reply);
    await g.sayAs(who, patch.explain);
    if (!known) {
      g.set(`bug:${bug.id}`);
      g.log.push(`LEARN bug ${bug.id}`);
      await g.narrate(`New in your review notes: ${bug.name}.`);
    }
    // the reviewers teach every patch they have; the Master stops at the first miss too many
    if (++missed > allowed && def.master) return false;
  }
  return missed <= allowed;
}
