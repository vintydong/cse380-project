export const PhysicsGroups = {
    PLAYER: "PLAYER",
    WEAPON: "WEAPON",
    GROUND: "GROUND",
    DESTRUCTIBLE: "DESTRUCTIBLE",
    NPC: "NPC",
    NPC_PROJECTILE: "NPC_PROJECTILE",
    NPC_WALLS: "NPC_WALLS",
    LEVEL_END: "LEVEL_END",
} as const;

export type PhysicOptions = {
    // The names of the collision groups to add to the physics manager for this scene
    groupNames: string[];
    // The collision map for the different collision groups
    collisions: number[][];
}

/**
 * Collision map between Physics groups
 *              Ground  Player  Weapon  Destructible    NPC NPC Projectile  NPC_Walls   LEVEL_END
 * Ground       0       1       1       0               1   0               0           0
 * Player       1       0       0       1               0   0               0           0
 * Weapon       1       0       0       1               1   0               0           0
 * Destructible 0       1       1       0               0   0               0           0
 * NPC          1       0       1       0               0   0               1           0
 * NPC Projectil0       0       0       0               0   0               0           0
 * NPC_Walls    0       0       0       0               1   0               1           0
 * LEVEL_END    0       0       0       0               0   0               0           0
 */
export const PhysicsCollisionMap: PhysicOptions = {
        groupNames: [
            PhysicsGroups.GROUND, 
            PhysicsGroups.PLAYER, 
            PhysicsGroups.WEAPON, 
            PhysicsGroups.DESTRUCTIBLE,
            PhysicsGroups.NPC,
            PhysicsGroups.NPC_PROJECTILE,
            PhysicsGroups.NPC_WALLS,
            PhysicsGroups.LEVEL_END,
        ],
        collisions:
        [
            [0, 1, 1, 0, 1, 0, 0, 0],
            [1, 0, 0, 1, 0, 0, 0, 0],
            [1, 0, 0, 1, 1, 0, 0, 0],
            [0, 1, 1, 0, 0, 0, 0, 0],
            [1, 0, 1, 0, 0, 0, 1, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 1, 0, 1, 0],
            [0, 0, 0, 0 ,0 ,0, 0, 0]
        ]
}