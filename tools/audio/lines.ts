// Finds every line a character can speak, straight from the source: say/sayAs calls, hotspot
// and item texts (Mac says those), dialogue options (Mac says the one you pick) and the code reviews.
// Lines built from template strings with ${...} can't be pre-rendered; they stay text-only.
// Usage: npx tsx tools/audio/lines.ts   (prints a report)
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { parseSync } from 'rolldown/utils';
import { content } from '../../src/content/index';
import { voiceKey } from '../../src/engine/audio';
import { NOTHING } from '../../src/engine/codeReview';

/** What kind of line: spoken in a scene, a picked dialogue option, a look/use comment, or a code review. */
export type LineKind = 'scene' | 'option' | 'comment' | 'duel';
export interface Line { speaker: string; text: string; key: string; where: string; kind: LineKind }

const ROOT = resolve(import.meta.dirname, '../..');
const REVIEWERS = ['nell', 'bob', 'larry'];
/** Hotspot/item/fallback properties whose plain text Mac says out loud. */
const MAC_PROPS = new Set(['look', 'use', 'pickup', 'push', 'pull', 'open', 'close', 'talk', 'walk', 'give', 'anyItem', 'combine', 'roleRefusal']);
/** Objects whose values are all Mac lines, keyed by item id. */
const MAC_MAPS = new Set(['giveItem', 'useItem']);
/** In objects with `who: '<character>'`, the properties that character says. */
const WHO_PROPS = new Set(['q', 'yes', 'wrong', 'lines']);
const characters = new Set(Object.keys(content.characters));

type Node = any;

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : p.endsWith('.ts') ? [p] : [];
  });
}

/** File-level `const x = 'text'` (or a list of them), so `g.say(x)` and `'...' + x` resolve. */
let consts = new Map<string, Node>();

/** Every complete string an expression can evaluate to (strings, arrays, ternaries, g.random([...]), 'a' + b). */
function texts(n: Node, out: string[] = [], dynamic = { n: 0 }): string[] {
  if (!n) return out;
  switch (n.type) {
    case 'Identifier': if (consts.has(n.name)) texts(consts.get(n.name), out, dynamic); break;
    case 'BinaryExpression':
      if (n.operator === '+') {
        const l = texts(n.left, [], dynamic), r = texts(n.right, [], dynamic);
        for (const a of l) for (const b of r) out.push(a + b);
      }
      break;
    case 'Literal': if (typeof n.value === 'string') out.push(n.value); break;
    case 'TemplateLiteral': {
      // `Provider: ${done ? 'done!' : 'go to the Temple.'}` -> both; anything not knowable stays dynamic
      let acc = [n.quasis[0].value.cooked as string];
      for (let i = 0; i < n.expressions.length && acc.length; i++) {
        const parts = texts(n.expressions[i], [], dynamic);
        acc = parts.flatMap((x) => acc.map((a) => a + x + n.quasis[i + 1].value.cooked));
      }
      if (acc.length) out.push(...acc); else dynamic.n++;
      break;
    }
    case 'ArrayExpression': for (const e of n.elements) texts(e, out, dynamic); break;
    case 'ConditionalExpression': texts(n.consequent, out, dynamic); texts(n.alternate, out, dynamic); break;
    case 'LogicalExpression': texts(n.left, out, dynamic); texts(n.right, out, dynamic); break;
    case 'TSAsExpression': case 'TSSatisfiesExpression': case 'ParenthesizedExpression': texts(n.expression, out, dynamic); break;
    case 'CallExpression':
      if (n.callee.type === 'MemberExpression' && n.callee.property.name === 'random') texts(n.arguments[0], out, dynamic);
      break;
    case 'MemberExpression':
      // { nell: '...', bob: '...' }[id]
      if (n.object.type === 'ObjectExpression') for (const p of n.object.properties) texts(p.value, out, dynamic);
      break;
  }
  return out;
}

function walk(n: Node, visit: (n: Node, parents: Node[]) => void, parents: Node[] = []) {
  if (!n || typeof n !== 'object') return;
  if (Array.isArray(n)) { for (const c of n) walk(c, visit, parents); return; }
  if (typeof n.type === 'string') visit(n, parents);
  const next = typeof n.type === 'string' ? [...parents, n] : parents;
  for (const k of Object.keys(n)) if (k !== 'type' && n[k] && typeof n[k] === 'object') walk(n[k], visit, next);
}

/** Looks through `x as T`, `x satisfies T` and parentheses. */
const unwrap = (n: Node): Node => (n && /^(TSAsExpression|TSSatisfiesExpression|ParenthesizedExpression)$/.test(n.type) ? unwrap(n.expression) : n);
/** Option-shaped objects (`{ id, text, run }`) say their text in Mac's voice, wherever they are. */
const OPTION_KEYS = new Set(['run', 'end', 'when', 'once']);

const keyName = (p: Node) => (p?.key?.type === 'Identifier' ? p.key.name : p?.key?.type === 'Literal' ? String(p.key.value) : undefined);

/** Who speaks a call's argument: say() is Mac, sayAs('x') is x, d.say() is d's actor. */
function speakerOf(call: Node, actorVars: Map<string, string>): { who: string; arg: Node } | null {
  if (call.type !== 'CallExpression' || call.callee.type !== 'MemberExpression' || call.callee.computed) return null;
  const fn = call.callee.property.name;
  if (fn === 'sayAs' && call.arguments[0]?.type === 'Literal') return { who: call.arguments[0].value, arg: call.arguments[1] };
  if (fn !== 'say') return null;
  const who = sayer(call.callee.object, actorVars);
  return who ? { who, arg: call.arguments[0] } : null;
}

/** The speaker of `x.say(...)`: g is Mac, `const d = g.actor('node')` is Captain Node, anything else unknown. */
function sayer(obj: Node, actorVars: Map<string, string>): string | null {
  if (obj.type === 'Identifier') return obj.name === 'g' ? 'mac' : actorVars.get(obj.name) ?? null;
  if (obj.type === 'CallExpression' && obj.callee.property?.name === 'actor' && obj.arguments[0]?.type === 'Literal') return obj.arguments[0].value;
  return null;
}

/** Speech that goes through a variable: `g.say(opt.text)` makes every `text:` in the file Mac's,
 *  and `const fail = (lines, mac) => { g.sayAs('librarian', lines); g.say(mac) }` makes fail()'s arguments speech. */
function speechUses(program: Node, actorVars: Map<string, string>) {
  const propSpeaker = new Map<string, string>();
  const helpers = new Map<string, Map<number, string>>();
  walk(program, (n, parents) => {
    const sp = speakerOf(n, actorVars);
    if (!sp?.arg) return;
    const arg = sp.arg;
    if (arg.type === 'MemberExpression' && !arg.computed && arg.property.type === 'Identifier' && arg.object.type === 'Identifier') {
      propSpeaker.set(arg.property.name, sp.who);
    }
    // a parameter of the enclosing function, used as (part of) the speech
    const fnNode = [...parents].reverse().find((p) => /Function/.test(p.type));
    if (!fnNode) return;
    const params: string[] = fnNode.params.map((p: Node) => (p.type === 'Identifier' ? p.name : p.left?.name));
    const used = new Set<string>();
    walk(arg, (m) => { if (m.type === 'Identifier' && params.includes(m.name)) used.add(m.name); });
    if (!used.size) return;
    const decl = parents[parents.indexOf(fnNode) - 1];
    const name = decl?.type === 'VariableDeclarator' ? decl.id.name : fnNode.id?.name;
    if (!name) return;
    const m = helpers.get(name) ?? new Map<number, string>();
    for (const u of used) m.set(params.indexOf(u), sp.who);
    helpers.set(name, m);
  });
  // never treat the data the engine reads as speech
  for (const k of ['id', 'name', 'title', 'type']) propSpeaker.delete(k);
  return { propSpeaker, helpers };
}

export function collectLines(): { lines: Line[]; dynamic: number; unresolved: string[] } {
  const found = new Map<string, Line>();
  const dyn = { n: 0 };
  const unresolved: string[] = [];
  const add = (speakers: string[], list: string[], where: string, kind: LineKind = 'scene') => {
    for (const speaker of speakers) for (const text of list) {
      if (!/[A-Za-z]/.test(text)) continue; // "..." stays silent
      const key = voiceKey(speaker, text);
      if (!found.has(key)) found.set(key, { speaker, text, key, where, kind });
    }
  };

  const sources = [...files(join(ROOT, 'src/content')), join(ROOT, 'src/engine/core.ts'), join(ROOT, 'src/engine/codeReview.ts'), join(ROOT, 'src/engine/roles.ts')];
  for (const file of sources) {
    const code = readFileSync(file, 'utf8');
    const rel = relative(ROOT, file);
    const { program } = parseSync(file, code);
    // const d = g.actor('node')  ->  d.say(...) is Captain Node talking
    const actorVars = new Map<string, string>();
    consts = new Map();
    walk(program, (n, parents) => {
      if (n.type === 'VariableDeclarator' && n.id.type === 'Identifier'
        && (n.init?.type === 'Literal' && typeof n.init.value === 'string' || n.init?.type === 'TemplateLiteral' && !n.init.expressions.length)) {
        consts.set(n.id.name, n.init);
      }
      if (n.type === 'VariableDeclarator' && n.id.type === 'Identifier' && n.init?.type === 'CallExpression'
        && n.init.callee.type === 'MemberExpression' && n.init.callee.property.name === 'actor' && n.init.arguments[0]?.type === 'Literal') {
        actorVars.set(n.id.name, n.init.arguments[0].value);
      }
    });
    const { propSpeaker, helpers } = speechUses(program, actorVars);
    walk(program, (n, parents) => {
      const where = `${rel}:${code.slice(0, n.start).split('\n').length}`;
      // fail(['librarian line'], 'Mac line'): a local helper that speaks its arguments
      if (n.type === 'CallExpression' && n.callee.type === 'Identifier' && helpers.has(n.callee.name)) {
        for (const [i, who] of helpers.get(n.callee.name)!) add([who], texts(n.arguments[i], [], dyn), where);
      }
      // { text: 'Mac line', reply: 'Formsworth line' } when the file speaks opt.text and opt.reply
      if (n.type === 'Property' && !n.computed && propSpeaker.has(keyName(n)!)) {
        const obj = parents[parents.length - 1];
        const silent = obj?.properties?.some((p: Node) => keyName(p) === 'say' && p.value.value === false || keyName(p) === 'who');
        if (!silent) add([propSpeaker.get(keyName(n)!)!], texts(n.value, [], dyn), where);
      }
      // intercept: (g, verb, t) => 'Mmmph!' - what it returns, Mac says
      if (n.type === 'ReturnStatement' && parents.some((p) => p.type === 'Property' && keyName(p) === 'intercept')) {
        add(['mac'], texts(n.argument, [], dyn), where, 'comment');
      }
      if (n.type === 'CallExpression' && n.callee.type === 'MemberExpression' && !n.callee.computed) {
        const fn = n.callee.property.name;
        if (fn === 'sayAs') {
          const who = n.arguments[0];
          let speakers: string[] = [];
          if (who?.type === 'Literal') speakers = [who.value];
          else if (rel.endsWith('crossroads.ts')) speakers = REVIEWERS;              // sayAs(id | who | reviewer(g), ...)
          else if (rel.endsWith('codeReview.ts')) speakers = [...REVIEWERS, 'master'];
          if (!speakers.length) { unresolved.push(where); return; }
          add(speakers, texts(n.arguments[1], [], dyn), where);
        } else if (fn === 'say') {
          const speaker = sayer(n.callee.object, actorVars);
          if (speaker) add([speaker], texts(n.arguments[0], [], dyn), where);
        }
      } else if (n.type === 'Property' && !n.computed) {
        const k = keyName(n);
        const parentProp = parents[parents.length - 2]?.type === 'Property' ? keyName(parents[parents.length - 2]) : undefined;
        if (k && MAC_PROPS.has(k) && n.value.type !== 'ArrowFunctionExpression' && n.value.type !== 'FunctionExpression') {
          add(['mac'], texts(n.value, [], dyn), where, 'comment');
        } else if (parentProp && MAC_MAPS.has(parentProp) && n.value.type !== 'ArrowFunctionExpression') {
          add(['mac'], texts(n.value, [], dyn), where, 'comment');
        } else if (k === 'lines' && rel.endsWith('hints.ts') && !parents[parents.length - 1]?.properties?.some((p: Node) => keyName(p) === 'who')) {
          add(['mac'], texts(n.value, [], dyn), where, 'comment');  // the duck hints: Mac thinking out loud
        } else if (k === 'text' && (parents.some((p) => p.type === 'Property' && keyName(p) === 'options')
          || parents[parents.length - 1]?.properties?.some((p: Node) => OPTION_KEYS.has(keyName(p)!)))) {
          // a dialogue option: Mac says it when picked (unless say: false)
          const obj = parents[parents.length - 1];
          const silent = obj?.properties?.some((p: Node) => keyName(p) === 'say' && p.value.value === false);
          if (!silent) add(['mac'], texts(n.value, [], dyn), where, 'option');
        }
      } else if (n.type === 'ObjectExpression' && characters.has(n.properties.find((p: Node) => keyName(p) === 'who')?.value?.value)) {
        // { who: 'xena', q: '...', yes: [...], wrong: { id: [...] } } and #ai-contrib's { who, lines }
        const who = n.properties.find((p: Node) => keyName(p) === 'who').value.value;
        for (const p of n.properties) {
          if (!WHO_PROPS.has(keyName(p)!)) continue;
          const v = unwrap(p.value);
          if (v.type === 'ObjectExpression') for (const q of v.properties) add([who], texts(q.value, [], dyn), where);
          else add([who], texts(p.value, [], dyn), where);
        }
      } else if (n.type === 'VariableDeclarator' && n.init?.type === 'ObjectExpression' && n.init.properties.length) {
        // tables keyed by speaker: const INTROS = { nell: [...], bob: [...] }
        const keys = n.init.properties.map(keyName);
        if (keys.every((k: string | undefined) => k && characters.has(k))) {
          for (const p of n.init.properties) add([keyName(p)!], texts(p.value, [], dyn), where);
        }
      }
    });
  }

  // Code review: the reviewer presents, replies and explains; Mac writes the comments
  for (const p of content.patches) {
    add([p.who], [...p.intro, ...p.decoys.map((d) => d.reply), ...p.explain, ...p.yes], 'patches', 'duel');
    add(['mac'], p.decoys.map((d) => d.text), 'patches', 'duel');
  }
  add(['mac'], [...content.bugs.map((b) => b.comment), NOTHING], 'bugs', 'duel');

  // everything the test suite heard spoken (npm run audio:record): template strings, helper arguments...
  const spoken = join(ROOT, 'tools/audio/spoken.jsonl');
  if (existsSync(spoken)) {
    for (const row of readFileSync(spoken, 'utf8').split('\n')) {
      if (!row) continue;
      const [speaker, text, room] = JSON.parse(row) as [string, string, string];
      if (content.rooms[room]) add([speaker], [text], `heard in ${room}`, speaker === 'mac' ? 'comment' : 'scene');
    }
  }

  // only speakers that exist (drops narration-ish strings caught by loose rules)
  const lines = [...found.values()].filter((l) => characters.has(l.speaker));
  return { lines, dynamic: dyn.n, unresolved };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { lines, dynamic, unresolved } = collectLines();
  const by = new Map<string, { n: number; chars: number }>();
  for (const l of lines) {
    const s = by.get(l.speaker) ?? { n: 0, chars: 0 };
    s.n++; s.chars += l.text.length;
    by.set(l.speaker, s);
  }
  console.log([...by.entries()].sort((a, b) => b[1].chars - a[1].chars).map(([s, v]) => `${s.padEnd(12)} ${String(v.n).padStart(5)} lines ${String(v.chars).padStart(7)} chars`).join('\n'));
  console.log(`\n${lines.length} lines, ${lines.reduce((a, l) => a + l.text.length, 0)} characters. ${dynamic} template lines stay text-only.`);
  if (unresolved.length) console.log(`Speaker not resolved at: ${unresolved.join(', ')}`);
}
