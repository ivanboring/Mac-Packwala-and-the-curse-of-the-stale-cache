import type { Game } from '../../../engine/types';

const TRIALS = ['providerReady', 'automatorDone', 'masterBeaten'] as const;

/** Shows the trial card and, once all three are done, points Mac back to the Grand Maintainer. */
export async function trialComplete(g: Game, title: string, tagline: string) {
  const done = TRIALS.filter((f) => g.flag(f)).length;
  await g.card([title, 'complete!', '', tagline, '', `Trials passed: ${done} of 3`], 3200);
  if (done === 3) {
    await g.say([
      'That was the third trial! Provider, Automator, Agents. All done.',
      'Time to go back to town and wake up the Grand Maintainer. Again.',
    ]);
  }
}
