// Act 1 aggregator: everything this act owns is registered here.
import type { CharacterDef, Dialogue, ItemDef, RoomDef } from '../engine/types';
import { beach, beachDialogues } from './rooms/act1/beach';
import { act1Items } from './items/act1';
import { act1Characters } from './characters/act1';
import { lookout, lookoutDialogues } from './rooms/act1/lookout';
import { square, squareDialogues } from './rooms/act1/square';
import { harbour, harbourDialogues } from './rooms/act1/harbour';
import { tavern, tavernDialogues } from './rooms/act1/tavern';
import { emporium, emporiumDialogues } from './rooms/act1/emporium';
import { bandstand, bandstandDialogues } from './rooms/act1/bandstand';

export const rooms: RoomDef[] = [beach, lookout, square, harbour, tavern, emporium, bandstand];
export const items: ItemDef[] = [...act1Items];
export const characters: CharacterDef[] = [...act1Characters];
export const dialogues: Dialogue[] = [...beachDialogues, ...lookoutDialogues, ...squareDialogues, ...harbourDialogues, ...tavernDialogues, ...emporiumDialogues, ...bandstandDialogues];
