/**
 * Events that get emitted in Shadow Knight
*/
export const CustomGameEvents = {
  ENEMY_HIT: "ENEMY_HIT",
  /** Event emitted when an enemy has been damaged
   * Data: { node: number, damage: number}
   * node is the id of the GameNode (enemy) that should be damaged
   * damage is the amount of health that should be decreased
   */
  ENEMY_DAMAGE: "ENEMY_DAMAGE",
  /** Event emitted when player collides with an enemy */
  PLAYER_ENEMY_COLLISION: "ENEMY_COLLISION",
  /** Event emitted when enemy fired a projectile */
  PLAYER_ENEMY_PROJECTILE_COLLISION: "ENEMY_PROJECTILE_COLLISION",
  /** Event emitted when player kills the boss */
  BOSS_KILLED: "BOSS_KILLED",

  SKILL_1_FIRED: "SKILL_1_FIRED",
  SKILL_2_FIRED: "SKILL_2_FIRED",
  SKILL_3_FIRED: "SKILL_3_FIRED",
  SKILL_4_FIRED: "SKILL_4_FIRED",
  UPDATE_HEALTH: "UPDATE_HEALTH",
  TOGGLE_SKILL_BOOK: "TOGGLE_SKILL_BOOK",

  /** Event emitted when level should start */
  LEVEL_START: "LEVEL_START",
  /** Event emitted when level should begin to end */
  LEVEL_END: "LEVEL_END",
  /** Event emitted when level should change to next */
  LEVEL_NEXT: "LEVEL_NEXT",
  /** Event emitted when level failed e.g. player died */
  LEVEL_FAILED: "LEVEL_FAILED",
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
