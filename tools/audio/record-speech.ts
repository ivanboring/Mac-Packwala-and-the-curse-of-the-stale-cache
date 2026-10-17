// Vitest setup file for `npm run audio:record`: writes every line a character speaks while the
// test suite plays the game to tools/audio/spoken.jsonl. lines.ts adds those to what it finds in
// the source, which catches lines the source scan can't see (template strings, helper arguments).
import { appendFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { GameCore } from '../../src/engine/core';

const OUT = resolve(import.meta.dirname, 'spoken.jsonl');
const sayAs = GameCore.prototype.sayAs;
GameCore.prototype.sayAs = function (actor: string, text: string | string[]) {
  const room = this.state.room;
  for (const t of Array.isArray(text) ? text : [text]) appendFileSync(OUT, JSON.stringify([actor, t, room]) + '\n');
  return sayAs.call(this, actor, text);
};
