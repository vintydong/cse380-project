/**
 * Events that get emitted in Shadow Knight
*/
export const CustomGameEvents = {
  ENEMY_HIT: "ENEMY_HIT",
  SKILL_1_FIRED: "SKILL_1_FIRED",
  SKILL_2_FIRED: "SKILL_2_FIRED",
  SKILL_3_FIRED: "SKILL_3_FIRED",
  SKILL_4_FIRED: "SKILL_4_FIRED",
  UPDATE_HEALTH: "UPDATE_HEALTH",
  TOGGLE_SKILL_BOOK: "TOGGLE_SKILL_BOOK",

  LEVEL_START: "LEVEL_START",
  /** Event emitted when level should begin to end */
  LEVEL_END: "LEVEL_END",
  /** Event emitted when level should change to next */
  LEVEL_NEXT: "LEVEL_NEXT",
  /* Event emitted when player has entered the level end area 
   * Level end condition should be checked e.g. all enemies defeated 
  */
  PLAYER_ENTER_LEVEL_END: "PLAYER_ENTER_LEVEL_END"
} as const;

export type CustomGameEvent = typeof CustomGameEvents[keyof typeof CustomGameEvents]


export const MenuEvents = {
  RESUME: "RESUME",
  PAUSE: "PAUSE",
  RESTART: "RESTART",
  CONTROLS: "CONTROLS",
  HELP: "HELP",
  EXIT: "EXIT",
} as const;

export type MenuEvent = typeof MenuEvents[keyof typeof MenuEvents]
