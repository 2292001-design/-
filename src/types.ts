/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Character, Stage, Dialogue, Ending } from './gameData';

export type Direction = 'NORTH' | 'EAST' | 'SOUTH' | 'WEST';
export type View = 'INTRO' | 'MAIN' | 'ENDING_CHOICE';

export interface GameState {
  currentStageIdx: number;
  inventory: string[];
  solvedStages: number[];
  selectedCharacterId: string | null;
  activeDialogue: string | null;
  ending: string | null;
  direction: Direction;
  inspectingObject: string | null;
}
