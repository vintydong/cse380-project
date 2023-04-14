export const PhysicsGroups = {
    PLAYER: "PLAYER",
    WEAPON: "WEAPON",
    GROUND: "GROUND",
    DESTRUCTIBLE: "DESTRUCTIBLE",
    NPC: "NPC",
    NPC_WALLS: "NPC_WALLS",
} as const;

export type PhysicOptions = {
    // The names of the collision groups to add to the physics manager for this scene
    groupNames: string[];
    // The collision map for the different collision groups
    collisions: number[][];
}

/**
 * Collision map between Physics groups
 *              Ground  Player  Weapon  Destructible    NPC NPC_Walls
 * Ground       0       1       1       0               1   0
 * Player       1       0       0       1               1   0
 * Weapon       1       0       0       1               1   0
 * Destructible 0       1       1       0               0   0
 * NPC          1       1       1       0               1   1
 * NPC_Walls    0       0       0       0               1   1
 */
export const PhysicsCollisionMap: PhysicOptions = {
        groupNames: [
            PhysicsGroups.GROUND, 
            PhysicsGroups.PLAYER, 
            PhysicsGroups.WEAPON, 
            PhysicsGroups.DESTRUCTIBLE,
            PhysicsGroups.NPC,
            PhysicsGroups.NPC_WALLS,
        ],
        collisions:
        [
            [0, 1, 1, 0, 1, 0],
            [1, 0, 0, 1, 1, 0],
            [1, 0, 0, 1, 1, 0],
            [0, 1, 1, 0, 0, 0],
            [1, 1, 1, 0, 1, 1],
            [0, 0, 0, 0, 1, 1],
        ]
}