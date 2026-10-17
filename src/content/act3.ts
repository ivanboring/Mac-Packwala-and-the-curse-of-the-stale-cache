// Act 3 aggregator: everything this act owns is registered here.
import type { CharacterDef, Dialogue, ItemDef, RoomDef } from '../engine/types';
import { act3Characters } from './characters/act3';
import { act3Items } from './items/act3';
import { lighthouse, lighthouseDialogues } from './rooms/act3/lighthouse';
import { lamproom, lamproomDialogues } from './rooms/act3/lamproom';
import { reef, reefDialogues } from './rooms/act3/reef';
import { rosetta, rosettaDialogues } from './rooms/act3/rosetta';

export const rooms: RoomDef[] = [lighthouse, lamproom, reef, rosetta];
export const items: ItemDef[] = [...act3Items];
export const characters: CharacterDef[] = [...act3Characters];
export const dialogues: Dialogue[] = [...lighthouseDialogues, ...lamproomDialogues, ...reefDialogues, ...rosettaDialogues];
