// Act 2 aggregator: everything this act owns is registered here.
import type { CharacterDef, Dialogue, Game, ItemDef, RoomDef } from '../engine/types';
import type { BugDef, DuelDef, PatchDef } from '../engine/core';
import { act2Characters } from './characters/act2';
import { act2Items } from './items/act2';
import { bugs as bugList, patches as patchList } from './reviews';
import { map } from './rooms/act2/map';
import { keyhut, keyhutDialogues } from './rooms/act2/keyhut';
import { temple, templeDialogues } from './rooms/act2/temple';
import { mill, millDialogues } from './rooms/act2/mill';
import { waterfall } from './rooms/act2/waterfall';
import { library, libraryDialogues } from './rooms/act2/library';
import { graveyard, graveyardDialogues } from './rooms/act2/graveyard';
import { dojo, dojoDialogues, masterDuel } from './rooms/act2/dojo';
import { crossroads, crossroadsDialogues, crossroadsDuels, crossroadsAfterDuel } from './rooms/act2/crossroads';

export const rooms: RoomDef[] = [map, keyhut, temple, mill, crossroads, waterfall, dojo, library, graveyard];
export const items: ItemDef[] = [...act2Items];
export const characters: CharacterDef[] = [...act2Characters];
export const dialogues: Dialogue[] = [...keyhutDialogues, ...templeDialogues, ...millDialogues, ...crossroadsDialogues, ...dojoDialogues, ...libraryDialogues, ...graveyardDialogues];

export const duels: DuelDef[] = [...crossroadsDuels, masterDuel];
export const bugs: BugDef[] = bugList;
export const patches: PatchDef[] = patchList;

/** Called after every code review. */
export async function afterDuel(g: Game, duel: DuelDef, won: boolean) {
  await crossroadsAfterDuel(g, duel, won);
}
